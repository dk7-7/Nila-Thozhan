-- 001_enums_and_extensions.sql
-- Enable PostGIS & cryptographic extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. User Roles
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('CITIZEN', 'OFFICER', 'HIGH_AUTHORITY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Document Status State Machine
DO $$ BEGIN
    CREATE TYPE document_status AS ENUM (
        'PROCESSING',
        'DIGITIZED',
        'UNDER_VERIFICATION',
        'GIS_VERIFIED',
        'READY_FOR_APPROVAL',
        'APPROVED',
        'REJECTED',
        'NEEDS_ATTENTION'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Document Types
DO $$ BEGIN
    CREATE TYPE document_type AS ENUM (
        'Sale Deed',
        'Patta / RoR',
        'Gift Deed',
        'Partition Deed',
        'Inheritance Title',
        'A-Register',
        'Encumbrance Certificate',
        'Settlement Deed',
        'Lease Deed',
        'Mortgage Deed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. Validation Status
DO $$ BEGIN
    CREATE TYPE validation_status AS ENUM (
        'VERIFIED',
        'NEEDS_MANUAL_REVIEW',
        'CONFLICT',
        'PARTIALLY_VERIFIED',
        'REJECTED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 5. Confidence Level
DO $$ BEGIN
    CREATE TYPE confidence_level AS ENUM ('HIGH', 'MEDIUM', 'LOW');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 6. GIS Parcel Status
DO $$ BEGIN
    CREATE TYPE gis_parcel_status AS ENUM (
        'VERIFIED',
        'PENDING',
        'CONFLICT',
        'BUFFER_RESTRICTED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 7. Notification Type
DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM (
        'INFO',
        'WARNING',
        'SUCCESS',
        'ACTION_REQUIRED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 8. Ticket Priority & Status
DO $$ BEGIN
    CREATE TYPE ticket_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ticket_status AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 9. Query Status
DO $$ BEGIN
    CREATE TYPE query_status AS ENUM ('OPEN', 'RESOLVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 10. Evidence Source & Status
DO $$ BEGIN
    CREATE TYPE evidence_source AS ENUM (
        'Document',
        'Land Record',
        'GIS',
        'Historical Record',
        'Field Survey'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE evidence_status AS ENUM (
        'MATCH',
        'MISMATCH',
        'UNAVAILABLE',
        'REVIEW_NEEDED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 11. Officer Recommendation Action
DO $$ BEGIN
    CREATE TYPE recommendation_action AS ENUM (
        'APPROVE',
        'RETURN',
        'REJECT',
        'NEEDS_MANUAL_REVIEW'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
