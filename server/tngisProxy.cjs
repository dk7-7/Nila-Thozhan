const express = require("express");
const cors = require("cors");
const axios = require("axios");
const CryptoJS = require("crypto-js");

const { CookieJar } = require("tough-cookie");
const { wrapper } = require("axios-cookiejar-support");

const app = express();

/* =========================================================
   CORS
========================================================= */

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"],
    credentials: true,
  })
);

app.use(express.json());

/* =========================================================
   TNGIS ENDPOINTS
========================================================= */

const GI_API_BASE =
  "https://tngis.tn.gov.in/apps/gi_viewer_api/gi_mvc/api/v1";

const GENERIC_API_BASE =
  "https://tngis.tn.gov.in/apps/generic_api/v1";

/* =========================================================
   TNGIS SESSION / COOKIE JAR
========================================================= */

const jar = new CookieJar();

const tngis = wrapper(
  axios.create({
    jar,
    withCredentials: true,
  })
);

/* =========================================================
   ENCRYPTION (AES-256 CBC with PBKDF2 / SHA512)
========================================================= */

class Encryption {
  constructor() {
    this.iterations = 1000;
  }

  encrypt(string, key) {
    if (!string) return null;

    const salt = CryptoJS.lib.WordArray.random(16);
    const iv = CryptoJS.lib.WordArray.random(16);

    const hashKey = CryptoJS.PBKDF2(key, salt, {
      hasher: CryptoJS.algo.SHA512,
      keySize: 256 / 32,
      iterations: this.iterations,
    });

    const encrypted = CryptoJS.AES.encrypt(string, hashKey, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    const data = {
      ciphertext: encrypted.ciphertext.toString(CryptoJS.enc.Base64),
      iv: CryptoJS.enc.Hex.stringify(iv),
      salt: CryptoJS.enc.Hex.stringify(salt),
      iterations: this.iterations,
    };

    return CryptoJS.enc.Base64.stringify(
      CryptoJS.enc.Utf8.parse(JSON.stringify(data))
    );
  }

  decrypt(encryptedString, key) {
    if (!encryptedString) return null;

    const jsonString = CryptoJS.enc.Utf8.stringify(
      CryptoJS.enc.Base64.parse(encryptedString)
    );

    const json = JSON.parse(jsonString);
    const salt = CryptoJS.enc.Hex.parse(json.salt);
    const iv = CryptoJS.enc.Hex.parse(json.iv);
    const iterations = parseInt(json.iterations) || this.iterations;

    const hashKey = CryptoJS.PBKDF2(key, salt, {
      hasher: CryptoJS.algo.SHA512,
      keySize: 256 / 32,
      iterations,
    });

    const decrypted = CryptoJS.AES.decrypt(json.ciphertext, hashKey, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    const result = decrypted.toString(CryptoJS.enc.Utf8);
    if (!result) {
      throw new Error("Empty decrypted response");
    }

    return result;
  }
}

const encryption = new Encryption();

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/api/test", (req, res) => {
  res.json({
    success: 1,
    message: "NILA THOZHAN TNGIS Backend Proxy is running",
    timestamp: new Date().toISOString(),
  });
});

/* =========================================================
   LAND INFO (Coordinate click lookup -> Tamil Nilam)
========================================================= */

app.post("/api/land-info", async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: 0,
        message: "Latitude and longitude are required",
      });
    }

    console.log(`[TNGIS Proxy] Land-info request for Lat: ${latitude}, Lon: ${longitude}`);

    // Step 1: Session Key
    const sessionResponse = await tngis.get(`${GI_API_BASE}/session-key`, {
      headers: {
        Accept: "application/json",
        Origin: "https://tngis.tn.gov.in",
        Referer: "https://tngis.tn.gov.in/",
      },
    });

    const { sessionKey, sessionId, csrfToken } = sessionResponse.data;

    if (!sessionKey || !sessionId || !csrfToken) {
      throw new Error("Tamil Nilam sessionKey/sessionId/csrfToken was not received");
    }

    // Step 2: Encrypt Payload
    const rawPayload = JSON.stringify({
      latitude,
      longitude,
      up: "",
      uid: "",
      timestamp: Date.now(),
    });

    const encryptedPayload = encryption.encrypt(rawPayload, sessionKey);
    if (!encryptedPayload) {
      throw new Error("Failed to encrypt Tamil Nilam payload");
    }

    // Step 3: Query TNGIS
    const landResponse = await tngis.post(
      `${GI_API_BASE}/land-info`,
      { payload: encryptedPayload },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Origin: "https://tngis.tn.gov.in",
          Referer: "https://tngis.tn.gov.in/",
          "X-Secure-Request": "true",
          "X-Session-ID": sessionId,
          "X-CSRF-Token": csrfToken,
        },
        timeout: 20000,
      }
    );

    const rawResponse = landResponse.data;
    if (!rawResponse?.payload) {
      return res.json(rawResponse);
    }

    // Step 4: Decrypt response
    const decrypted = encryption.decrypt(rawResponse.payload, sessionKey);
    const result = JSON.parse(decrypted);

    return res.json(result);
  } catch (error) {
    console.error("[TNGIS Proxy] Land info error:", error.message);
    return res.status(500).json({
      success: 0,
      message: error.response?.data || error.message || "Tamil Nilam land-info failed",
    });
  }
});

/* =========================================================
   VILLAGE LOOKUP
========================================================= */

app.post("/api/village-info", async (req, res) => {
  try {
    const { districtLgdCode, talukLgdCode } = req.body;

    if (!districtLgdCode || !talukLgdCode) {
      return res.status(400).json({
        success: 0,
        message: "District LGD code and Taluk LGD code are required",
        data: [],
      });
    }

    const response = await axios.post(
      `${GENERIC_API_BASE}/getAdminDropDown`,
      {
        case: "village",
        district: String(districtLgdCode),
        taluk: String(talukLgdCode),
        filter_code: "lgd_code",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Origin: "https://tngis.tn.gov.in",
          Referer: "https://tngis.tn.gov.in/",
        },
        timeout: 15000,
      }
    );

    const raw = response.data;
    let result = Array.isArray(raw) ? raw[0] || {} : raw;
    let data = result?.data || result?.result || result?.villages || [];
    if (!Array.isArray(data)) data = [];

    return res.json({
      success: result?.success ?? 1,
      message: result?.message || "Village data retrieved",
      data,
    });
  } catch (error) {
    console.error("[TNGIS Proxy] Village lookup error:", error.message);
    return res.status(500).json({
      success: 0,
      message: error.response?.data || error.message || "Village lookup failed",
      data: [],
    });
  }
});

/* =========================================================
   URBAN OWNERSHIP DETAILS
========================================================= */

app.post("/api/urban-ownership", async (req, res) => {
  try {
    const params = req.body || {};

    const sessionResponse = await tngis.get(`${GI_API_BASE}/session-key`, {
      headers: {
        Accept: "application/json",
        Origin: "https://tngis.tn.gov.in",
        Referer: "https://tngis.tn.gov.in/",
      },
    });

    const { sessionKey, sessionId, csrfToken } = sessionResponse.data;
    if (!sessionKey || !sessionId || !csrfToken) {
      throw new Error("Tamil Nilam sessionKey was not received");
    }

    const encryptedPayload = encryption.encrypt(JSON.stringify(params), sessionKey);
    if (!encryptedPayload) {
      throw new Error("Failed to encrypt urban ownership payload");
    }

    const ownershipResponse = await tngis.post(
      `${GI_API_BASE}/land/urban-ownership-details`,
      { payload: encryptedPayload },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Origin: "https://tngis.tn.gov.in",
          Referer: "https://tngis.tn.gov.in/",
          "X-Secure-Request": "true",
          "X-Session-ID": sessionId,
          "X-CSRF-Token": csrfToken,
        },
        timeout: 20000,
      }
    );

    const rawResponse = ownershipResponse.data;
    if (!rawResponse?.payload) {
      return res.json(rawResponse);
    }

    const decrypted = encryption.decrypt(rawResponse.payload, sessionKey);
    const result = JSON.parse(decrypted);

    return res.json(result);
  } catch (error) {
    console.error("[TNGIS Proxy] Urban ownership error:", error.message);
    return res.status(error.response?.status || 500).json({
      success: 0,
      message: error.response?.data || error.message || "Urban ownership lookup failed",
    });
  }
});

app.get("/api/urban-ownership", (req, res) => {
  res.json({
    success: 1,
    message: "Urban ownership route is available",
    endpoint: "/api/urban-ownership",
    method: "POST",
  });
});

/* =========================================================
   START PROXY SERVER
========================================================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n================================`);
  console.log(`NILA THOZHAN TNGIS PROXY RUNNING`);
  console.log(`http://localhost:${PORT}`);
  console.log(`================================\n`);
});
