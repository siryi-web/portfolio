# SCORM 1.2 E-Learning Project Rules
- Build lightweight, offline-capable e-learning modules using pure HTML5, CSS3, and ES6 JavaScript. No heavy external frameworks or build tools.
- Every module must include a valid, schema-compliant `imsmanifest.xml` for SCORM 1.2.
- Implement a robust SCORM 1.2 API wrapper in `logic.js` that handles `LMSInitialize`, `LMSSetValue`, `LMSCommit`, and `LMSFinish`.
- Provide a Node.js script (`package.js`) that bundles all required files into a `.zip` archive ready for LMS upload.
