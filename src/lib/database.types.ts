export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_events: {
        Row: {
          action: string
          actor_id: string | null
          actor_name: string
          actor_role: Database["public"]["Enums"]["user_role"]
          comments: string | null
          created_at: string
          digital_signature_id: string | null
          document_id: string | null
          id: string
          metadata: Json | null
          new_status: Database["public"]["Enums"]["document_status"] | null
          previous_status: Database["public"]["Enums"]["document_status"] | null
          status: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_name: string
          actor_role: Database["public"]["Enums"]["user_role"]
          comments?: string | null
          created_at?: string
          digital_signature_id?: string | null
          document_id?: string | null
          id?: string
          metadata?: Json | null
          new_status?: Database["public"]["Enums"]["document_status"] | null
          previous_status?:
            | Database["public"]["Enums"]["document_status"]
            | null
          status: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_name?: string
          actor_role?: Database["public"]["Enums"]["user_role"]
          comments?: string | null
          created_at?: string
          digital_signature_id?: string | null
          document_id?: string | null
          id?: string
          metadata?: Json | null
          new_status?: Database["public"]["Enums"]["document_status"] | null
          previous_status?:
            | Database["public"]["Enums"]["document_status"]
            | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_events_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "land_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      cadastral_boundaries: {
        Row: {
          created_at: string
          document_id: string
          east: string | null
          id: string
          north: string | null
          south: string | null
          tamil_east: string | null
          tamil_north: string | null
          tamil_south: string | null
          tamil_west: string | null
          updated_at: string
          west: string | null
        }
        Insert: {
          created_at?: string
          document_id: string
          east?: string | null
          id?: string
          north?: string | null
          south?: string | null
          tamil_east?: string | null
          tamil_north?: string | null
          tamil_south?: string | null
          tamil_west?: string | null
          updated_at?: string
          west?: string | null
        }
        Update: {
          created_at?: string
          document_id?: string
          east?: string | null
          id?: string
          north?: string | null
          south?: string | null
          tamil_east?: string | null
          tamil_north?: string | null
          tamil_south?: string | null
          tamil_west?: string | null
          updated_at?: string
          west?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cadastral_boundaries_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: true
            referencedRelation: "land_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      cadastral_details: {
        Row: {
          created_at: string
          document_id: string
          document_registration_number: string | null
          id: string
          land_classification: string | null
          patta_number: string | null
          relative_name: string | null
          sro_jurisdiction: string | null
          tamil_district: string | null
          tamil_owner_name: string | null
          tamil_taluk: string | null
          tamil_village: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          document_id: string
          document_registration_number?: string | null
          id?: string
          land_classification?: string | null
          patta_number?: string | null
          relative_name?: string | null
          sro_jurisdiction?: string | null
          tamil_district?: string | null
          tamil_owner_name?: string | null
          tamil_taluk?: string | null
          tamil_village?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          document_id?: string
          document_registration_number?: string | null
          id?: string
          land_classification?: string | null
          patta_number?: string | null
          relative_name?: string | null
          sro_jurisdiction?: string | null
          tamil_district?: string | null
          tamil_owner_name?: string | null
          tamil_taluk?: string | null
          tamil_village?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cadastral_details_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: true
            referencedRelation: "land_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      citizen_queries: {
        Row: {
          citizen_id: string
          created_at: string
          document_id: string
          id: string
          message: string
          officer_response: string | null
          responded_by: string | null
          status: Database["public"]["Enums"]["query_status"]
          subject: string
          updated_at: string
        }
        Insert: {
          citizen_id: string
          created_at?: string
          document_id: string
          id?: string
          message: string
          officer_response?: string | null
          responded_by?: string | null
          status?: Database["public"]["Enums"]["query_status"]
          subject: string
          updated_at?: string
        }
        Update: {
          citizen_id?: string
          created_at?: string
          document_id?: string
          id?: string
          message?: string
          officer_response?: string | null
          responded_by?: string | null
          status?: Database["public"]["Enums"]["query_status"]
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "citizen_queries_citizen_id_fkey"
            columns: ["citizen_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "citizen_queries_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "land_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "citizen_queries_responded_by_fkey"
            columns: ["responded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_signatures: {
        Row: {
          algorithm: string
          certificate_id: string
          document_hash: string
          document_id: string
          id: string
          signature_hash: string
          signed_at: string
          signer_designation: string
          signer_id: string
          signer_name: string
          verification_reference: string
        }
        Insert: {
          algorithm?: string
          certificate_id: string
          document_hash: string
          document_id: string
          id?: string
          signature_hash: string
          signed_at?: string
          signer_designation: string
          signer_id: string
          signer_name: string
          verification_reference: string
        }
        Update: {
          algorithm?: string
          certificate_id?: string
          document_hash?: string
          document_id?: string
          id?: string
          signature_hash?: string
          signed_at?: string
          signer_designation?: string
          signer_id?: string
          signer_name?: string
          verification_reference?: string
        }
        Relationships: [
          {
            foreignKeyName: "digital_signatures_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: true
            referencedRelation: "land_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_signatures_signer_id_fkey"
            columns: ["signer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      document_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          document_id: string
          id: string
          notes: string | null
          officer_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          document_id: string
          id?: string
          notes?: string | null
          officer_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          document_id?: string
          id?: string
          notes?: string | null
          officer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_assignments_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "land_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_assignments_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      extracted_fields: {
        Row: {
          confidence: Database["public"]["Enums"]["confidence_level"]
          confidence_score: number
          created_at: string
          document_id: string
          field_key: string
          field_name: string
          id: string
          is_verified: boolean
          notes: string | null
          updated_at: string
          value: string
        }
        Insert: {
          confidence?: Database["public"]["Enums"]["confidence_level"]
          confidence_score?: number
          created_at?: string
          document_id: string
          field_key: string
          field_name: string
          id?: string
          is_verified?: boolean
          notes?: string | null
          updated_at?: string
          value: string
        }
        Update: {
          confidence?: Database["public"]["Enums"]["confidence_level"]
          confidence_score?: number
          created_at?: string
          document_id?: string
          field_key?: string
          field_name?: string
          id?: string
          is_verified?: boolean
          notes?: string | null
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "extracted_fields_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "land_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      gis_parcels: {
        Row: {
          area_acres: number
          centroid_x: number
          centroid_y: number
          coordinates: Json
          created_at: string
          geom: unknown
          historical_boundary_match: boolean
          id: string
          land_use: string
          parcel_id: string
          road_access: boolean
          spatial_conflict: boolean
          status: Database["public"]["Enums"]["gis_parcel_status"]
          survey_number: string
          village: string
          water_body_adjacent: boolean
        }
        Insert: {
          area_acres: number
          centroid_x: number
          centroid_y: number
          coordinates: Json
          created_at?: string
          geom?: unknown
          historical_boundary_match?: boolean
          id?: string
          land_use: string
          parcel_id: string
          road_access?: boolean
          spatial_conflict?: boolean
          status?: Database["public"]["Enums"]["gis_parcel_status"]
          survey_number: string
          village: string
          water_body_adjacent?: boolean
        }
        Update: {
          area_acres?: number
          centroid_x?: number
          centroid_y?: number
          coordinates?: Json
          created_at?: string
          geom?: unknown
          historical_boundary_match?: boolean
          id?: string
          land_use?: string
          parcel_id?: string
          road_access?: boolean
          spatial_conflict?: boolean
          status?: Database["public"]["Enums"]["gis_parcel_status"]
          survey_number?: string
          village?: string
          water_body_adjacent?: boolean
        }
        Relationships: []
      }
      land_documents: {
        Row: {
          action_required_citizen: string | null
          assigned_officer: string | null
          citizen_email: string
          confidence_score: number
          created_at: string
          district: string
          document_number: string
          document_type: Database["public"]["Enums"]["document_type"]
          file_name: string | null
          file_size: string | null
          file_type: string | null
          file_url: string | null
          gis_parcel_id: string | null
          id: string
          land_area: string
          land_area_numeric: number
          officer_notes: string | null
          overall_confidence: Database["public"]["Enums"]["confidence_level"]
          owner_name: string
          scenario_type: string | null
          status: Database["public"]["Enums"]["document_status"]
          storage_path: string | null
          submission_date: string
          survey_number: string
          taluk: string
          title: string
          updated_at: string
          uploaded_by: string
          village: string
        }
        Insert: {
          action_required_citizen?: string | null
          assigned_officer?: string | null
          citizen_email: string
          confidence_score?: number
          created_at?: string
          district: string
          document_number: string
          document_type: Database["public"]["Enums"]["document_type"]
          file_name?: string | null
          file_size?: string | null
          file_type?: string | null
          file_url?: string | null
          gis_parcel_id?: string | null
          id?: string
          land_area: string
          land_area_numeric?: number
          officer_notes?: string | null
          overall_confidence?: Database["public"]["Enums"]["confidence_level"]
          owner_name: string
          scenario_type?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          storage_path?: string | null
          submission_date?: string
          survey_number: string
          taluk: string
          title: string
          updated_at?: string
          uploaded_by: string
          village: string
        }
        Update: {
          action_required_citizen?: string | null
          assigned_officer?: string | null
          citizen_email?: string
          confidence_score?: number
          created_at?: string
          district?: string
          document_number?: string
          document_type?: Database["public"]["Enums"]["document_type"]
          file_name?: string | null
          file_size?: string | null
          file_type?: string | null
          file_url?: string | null
          gis_parcel_id?: string | null
          id?: string
          land_area?: string
          land_area_numeric?: number
          officer_notes?: string | null
          overall_confidence?: Database["public"]["Enums"]["confidence_level"]
          owner_name?: string
          scenario_type?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          storage_path?: string | null
          submission_date?: string
          survey_number?: string
          taluk?: string
          title?: string
          updated_at?: string
          uploaded_by?: string
          village?: string
        }
        Relationships: [
          {
            foreignKeyName: "land_documents_assigned_officer_fkey"
            columns: ["assigned_officer"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "land_documents_gis_parcel_id_fkey"
            columns: ["gis_parcel_id"]
            isOneToOne: false
            referencedRelation: "gis_parcels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "land_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      legacy_land_records: {
        Row: {
          area_acres: number
          created_at: string
          district: string
          id: string
          mutation_year: number
          owner_name: string
          record_number: string
          record_status: string
          subdivision: string | null
          survey_number: string
          taluk: string
          village: string
        }
        Insert: {
          area_acres: number
          created_at?: string
          district: string
          id?: string
          mutation_year: number
          owner_name: string
          record_number: string
          record_status?: string
          subdivision?: string | null
          survey_number: string
          taluk: string
          village: string
        }
        Update: {
          area_acres?: number
          created_at?: string
          district?: string
          id?: string
          mutation_year?: number
          owner_name?: string
          record_number?: string
          record_status?: string
          subdivision?: string | null
          survey_number?: string
          taluk?: string
          village?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          document_id: string | null
          id: string
          message: string
          read: boolean
          recipient_id: string | null
          target_roles: Database["public"]["Enums"]["user_role"][]
          title: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          created_at?: string
          document_id?: string | null
          id?: string
          message: string
          read?: boolean
          recipient_id?: string | null
          target_roles?: Database["public"]["Enums"]["user_role"][]
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          created_at?: string
          document_id?: string | null
          id?: string
          message?: string
          read?: boolean
          recipient_id?: string | null
          target_roles?: Database["public"]["Enums"]["user_role"][]
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: [
          {
            foreignKeyName: "notifications_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "land_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      officer_recommendations: {
        Row: {
          action: Database["public"]["Enums"]["recommendation_action"]
          comments: string | null
          created_at: string
          document_id: string
          id: string
          officer_id: string
          officer_name: string
          reason: string
        }
        Insert: {
          action: Database["public"]["Enums"]["recommendation_action"]
          comments?: string | null
          created_at?: string
          document_id: string
          id?: string
          officer_id: string
          officer_name: string
          reason: string
        }
        Update: {
          action?: Database["public"]["Enums"]["recommendation_action"]
          comments?: string | null
          created_at?: string
          document_id?: string
          id?: string
          officer_id?: string
          officer_name?: string
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "officer_recommendations_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "land_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "officer_recommendations_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          designation: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean
          location: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          designation?: string | null
          email: string
          full_name: string
          id: string
          is_active?: boolean
          location?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          designation?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          location?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string
          contact_email: string
          created_at: string
          id: string
          message: string
          priority: Database["public"]["Enums"]["ticket_priority"]
          status: Database["public"]["Enums"]["ticket_status"]
          subject: string
          ticket_number: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          category: string
          contact_email: string
          created_at?: string
          id?: string
          message: string
          priority?: Database["public"]["Enums"]["ticket_priority"]
          status?: Database["public"]["Enums"]["ticket_status"]
          subject: string
          ticket_number: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          category?: string
          contact_email?: string
          created_at?: string
          id?: string
          message?: string
          priority?: Database["public"]["Enums"]["ticket_priority"]
          status?: Database["public"]["Enums"]["ticket_status"]
          subject?: string
          ticket_number?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      validation_evidence: {
        Row: {
          created_at: string
          detail: string
          extracted_value: string
          id: string
          report_id: string
          source: Database["public"]["Enums"]["evidence_source"]
          status: Database["public"]["Enums"]["evidence_status"]
        }
        Insert: {
          created_at?: string
          detail: string
          extracted_value: string
          id?: string
          report_id: string
          source: Database["public"]["Enums"]["evidence_source"]
          status?: Database["public"]["Enums"]["evidence_status"]
        }
        Update: {
          created_at?: string
          detail?: string
          extracted_value?: string
          id?: string
          report_id?: string
          source?: Database["public"]["Enums"]["evidence_source"]
          status?: Database["public"]["Enums"]["evidence_status"]
        }
        Relationships: [
          {
            foreignKeyName: "validation_evidence_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "validation_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      validation_reports: {
        Row: {
          ai_explanation_text: string | null
          conflicting_fields: string[] | null
          created_at: string
          deterministic_rules_passed: boolean
          document_id: string
          id: string
          plain_language_explanation: string
          primary_issue: string | null
          recommended_action: string
          status: Database["public"]["Enums"]["validation_status"]
          updated_at: string
        }
        Insert: {
          ai_explanation_text?: string | null
          conflicting_fields?: string[] | null
          created_at?: string
          deterministic_rules_passed?: boolean
          document_id: string
          id?: string
          plain_language_explanation: string
          primary_issue?: string | null
          recommended_action: string
          status?: Database["public"]["Enums"]["validation_status"]
          updated_at?: string
        }
        Update: {
          ai_explanation_text?: string | null
          conflicting_fields?: string[] | null
          created_at?: string
          deterministic_rules_passed?: boolean
          document_id?: string
          id?: string
          plain_language_explanation?: string
          primary_issue?: string | null
          recommended_action?: string
          status?: Database["public"]["Enums"]["validation_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "validation_reports_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: true
            referencedRelation: "land_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_history: {
        Row: {
          changed_by: string | null
          comments: string | null
          created_at: string
          document_id: string
          from_status: Database["public"]["Enums"]["document_status"] | null
          id: string
          to_status: Database["public"]["Enums"]["document_status"]
        }
        Insert: {
          changed_by?: string | null
          comments?: string | null
          created_at?: string
          document_id: string
          from_status?: Database["public"]["Enums"]["document_status"] | null
          id?: string
          to_status: Database["public"]["Enums"]["document_status"]
        }
        Update: {
          changed_by?: string | null
          comments?: string | null
          created_at?: string
          document_id?: string
          from_status?: Database["public"]["Enums"]["document_status"] | null
          id?: string
          to_status?: Database["public"]["Enums"]["document_status"]
        }
        Relationships: [
          {
            foreignKeyName: "workflow_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_history_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "land_documents"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      approve_document_and_sign: {
        Args: {
          p_certificate_id: string
          p_doc_id: string
          p_signature_hash?: string
          p_signer_designation: string
          p_signer_name: string
        }
        Returns: Json
      }
      create_support_ticket: {
        Args: {
          p_category: string
          p_contact_email?: string
          p_message: string
          p_subject: string
        }
        Returns: Json
      }
      disablelongtransactions: { Args: never; Returns: string }
      dropgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
      dropgeometrytable:
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
      enablelongtransactions: { Args: never; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
      get_current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_system_reports_stats: { Args: never; Returns: Json }
      gettransactionid: { Args: never; Returns: unknown }
      longtransactionsenabled: { Args: never; Returns: boolean }
      populate_geometry_columns:
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
        | { Args: { use_typmod?: boolean }; Returns: string }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      resolve_gis_conflict: {
        Args: { p_doc_id: string; p_notes?: string; p_resolution: string }
        Returns: Json
      }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
      st_askml:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geog: unknown }; Returns: number }
        | { Args: { geom: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      submit_officer_decision: {
        Args: {
          p_action: Database["public"]["Enums"]["recommendation_action"]
          p_comments?: string
          p_doc_id: string
          p_reason: string
        }
        Returns: Json
      }
      unlockrows: { Args: { "": string }; Returns: number }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
    }
    Enums: {
      confidence_level: "HIGH" | "MEDIUM" | "LOW"
      document_status:
        | "PROCESSING"
        | "DIGITIZED"
        | "UNDER_VERIFICATION"
        | "GIS_VERIFIED"
        | "READY_FOR_APPROVAL"
        | "APPROVED"
        | "REJECTED"
        | "NEEDS_ATTENTION"
      document_type:
        | "Sale Deed"
        | "Patta / RoR"
        | "Gift Deed"
        | "Partition Deed"
        | "Inheritance Title"
        | "A-Register"
        | "Encumbrance Certificate"
        | "Settlement Deed"
        | "Lease Deed"
        | "Mortgage Deed"
      evidence_source:
        | "Document"
        | "Land Record"
        | "GIS"
        | "Historical Record"
        | "Field Survey"
      evidence_status: "MATCH" | "MISMATCH" | "UNAVAILABLE" | "REVIEW_NEEDED"
      gis_parcel_status:
        | "VERIFIED"
        | "PENDING"
        | "CONFLICT"
        | "BUFFER_RESTRICTED"
      notification_type: "INFO" | "WARNING" | "SUCCESS" | "ACTION_REQUIRED"
      query_status: "OPEN" | "RESOLVED"
      recommendation_action:
        | "APPROVE"
        | "RETURN"
        | "REJECT"
        | "NEEDS_MANUAL_REVIEW"
      ticket_priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
      ticket_status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
      user_role: "CITIZEN" | "OFFICER" | "HIGH_AUTHORITY"
      validation_status:
        | "VERIFIED"
        | "NEEDS_MANUAL_REVIEW"
        | "CONFLICT"
        | "PARTIALLY_VERIFIED"
        | "REJECTED"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      confidence_level: ["HIGH", "MEDIUM", "LOW"],
      document_status: [
        "PROCESSING",
        "DIGITIZED",
        "UNDER_VERIFICATION",
        "GIS_VERIFIED",
        "READY_FOR_APPROVAL",
        "APPROVED",
        "REJECTED",
        "NEEDS_ATTENTION",
      ],
      document_type: [
        "Sale Deed",
        "Patta / RoR",
        "Gift Deed",
        "Partition Deed",
        "Inheritance Title",
        "A-Register",
        "Encumbrance Certificate",
        "Settlement Deed",
        "Lease Deed",
        "Mortgage Deed",
      ],
      evidence_source: [
        "Document",
        "Land Record",
        "GIS",
        "Historical Record",
        "Field Survey",
      ],
      evidence_status: ["MATCH", "MISMATCH", "UNAVAILABLE", "REVIEW_NEEDED"],
      gis_parcel_status: [
        "VERIFIED",
        "PENDING",
        "CONFLICT",
        "BUFFER_RESTRICTED",
      ],
      notification_type: ["INFO", "WARNING", "SUCCESS", "ACTION_REQUIRED"],
      query_status: ["OPEN", "RESOLVED"],
      recommendation_action: [
        "APPROVE",
        "RETURN",
        "REJECT",
        "NEEDS_MANUAL_REVIEW",
      ],
      ticket_priority: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      ticket_status: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"],
      user_role: ["CITIZEN", "OFFICER", "HIGH_AUTHORITY"],
      validation_status: [
        "VERIFIED",
        "NEEDS_MANUAL_REVIEW",
        "CONFLICT",
        "PARTIALLY_VERIFIED",
        "REJECTED",
      ],
    },
  },
} as const
