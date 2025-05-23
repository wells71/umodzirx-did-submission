# UmodziRx Backend

## Overview
The UmodziRx backend is designed to support the UmodziRx application, providing necessary APIs and integrations with MOSIP and blockchain technologies.

## Technologies
- **Runtime**: Node.js v18 (LTS) with Express.js or NestJS.
- **Database**: PostgreSQL (for patient-MOSIP ID mappings) and CouchDB (for blockchain state).
- **Encryption**: libsodium (AES-256-GCM for IPFS data), Umbral (Proxy Re-Encryption).
- **Queueing**: RabbitMQ for asynchronous tasks (e.g., IPFS uploads, blockchain writes).

## Tasks
- Lazy-load non-critical components (e.g., audit logs) with React.lazy().
- Cache MOSIP ID tokens in localStorage (TTL: 1 hour).

## APIs
- **REST**: 
  - Prescription metadata
  - Audit logs
- **GraphQL**: 
  - Complex queries (e.g., "Fetch all prescriptions for MOSIP ID X").
- **MOSIP Integration**: 
  - MOSIP Kernel APIs: 
    - ID authentication (`/v1/auth/`)
    - Credential issuance (`/v1/kyc/`)
  - ABHA (Health ID) Service: Link MOSIP IDs to prescriptions.

## API Endpoints
- **POST /prescriptions**:
  - **Input**: Encrypted file, MOSIP ID, doctor’s license hash.
  - **Process**: Validate MOSIP ID → Encrypt → IPFS upload → Write to Fabric.
  
- **GET /consent/delegate**:
  - Generates PRE re-encryption key via Umbral; stores in Redis with MOSIP ID TTL.

## Database Schema
- **patients**: 
  - `mosip_id_hash` (varchar)
  - `public_key` (text)
  - `created_at` (timestamp)
  
- **access_grants**: 
  - `patient_id` (FK)
  - `pharmacy_id` (FK)
  - `pre_key` (text)
  - `expires_at` (timestamp)

## Middleware
- **Helmet.js**: Secure headers (HSTS, XSS Protection).
- **Rate Limiting**: 100 requests/min per MOSIP ID.

## MOSIP Integration
- **Technologies**: 
  - ID Authentication: `/idauthentication/v1/` (biometric/OTP auth).
  - ID Repository: Store hashed health IDs.
  - Credential Service: Issue verifiable medical credentials to providers.
  
- **Biometric Devices**: 
  - Mantra MFS100 for fingerprint scanning (MOSIP-certified).
  - Iris Scanners: Supports MOSIP’s IRIS SDK.

## ID Linking Workflow
1. Patient registers via MOSIP portal → Gets ABHA (Health ID).
2. System hashes ABHA → Stores in PostgreSQL with public key.

## KYC Workflow
- Pharmacies/doctors submit MOSIP-verified credentials (e.g., medical license PDF).
- OCR (Tesseract.js) extracts license details → Stored on-chain.
