# Emergency SOS Feature Specification

## User Story: Unconscious Patient Scenario

**Scenario**: Mr. Holmes is unconscious and taken to a hospital. Hospital staff needs his medical information but has no records. Emergency contacts need to be notified and share his health data.

## Feature Flow

### 1. SOS Trigger (Hospital Staff or Patient)
- Hospital staff accesses patient's phone/web app
- Taps "Emergency SOS" button
- System captures:
  - Current GPS location (using browser Geolocation API)
  - Hospital name/contact (optional: auto-detect from location or manual entry)
  - Timestamp
  - Emergency severity level

### 2. Emergency Contact Notification
- System sends SMS/WhatsApp message to all emergency contacts:
  ```
  🚨 EMERGENCY ALERT 🚨
  
  [Patient Name] requires immediate medical attention.
  
  Location: [Address/Latitude,Longitude]
  Hospital: [Hospital Name]
  Time: [Timestamp]
  
  Share Health Data: [Temporary Access Link]
  
  Hospital WhatsApp: [Contact Number]
  
  Tap link to view location: [Google Maps Link]
  ```

### 3. Emergency Contacts Receive & Respond
- Contacts receive message on WhatsApp/SMS
- Can click link to:
  - View patient location on map
  - Access temporary health data (critical info only)
  - Share health data with hospital via WhatsApp
  - View hospital contact information
  - Get real-time updates

### 4. Hospital Access to Health Data
- Hospital receives temporary access link (24-48 hour validity)
- QR code generated for hospital staff to scan
- Access limited to critical fields:
  - Blood type
  - Allergies (LIFE-THREATENING)
  - Current medications
  - Chronic conditions
  - Emergency contact info
  - Recent health metrics (last 30 days)

### 5. Two-Way Communication
- Hospital can send updates via integrated messaging
- Contacts can ask questions/share additional info
- Communication log stored in emergency event record

## Technical Implementation

### Web App Considerations

Since this is a **web app** (not native mobile), we need to:

1. **Geolocation API** (Browser)
   ```javascript
   navigator.geolocation.getCurrentPosition()
   ```
   - Requires user permission
   - Works on mobile browsers
   - Accuracy varies (GPS on mobile, network on desktop)

2. **SMS/WhatsApp Service**
   - **Option A**: Twilio (SMS + WhatsApp Business API)
   - **Option B**: Africa's Talking (for African markets)
   - **Option C**: WhatsApp Business API directly
   - Message templates with dynamic data

3. **Temporary Access Links**
   - Generate secure token (JWT with short expiry)
   - Store in `EmergencyEvent` model
   - QR code generation for hospital
   - Link format: `/emergency/access/[token]`

4. **PWA Features** (Future Enhancement)
   - Service Worker for offline access
   - Background sync for location updates
   - Push notifications for emergency alerts

### Database Schema

```javascript
// EmergencyEvent Model
{
  userId: ObjectId,
  triggeredBy: String, // 'hospital', 'patient', 'contact'
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  hospitalInfo: {
    name: String,
    phone: String,
    whatsapp: String,
    email: String
  },
  status: String, // 'active', 'resolved', 'cancelled'
  temporaryAccessToken: String,
  tokenExpiry: Date,
  emergencyContactsNotified: [{
    contactId: ObjectId,
    notificationMethod: String, // 'sms', 'whatsapp', 'email'
    notifiedAt: Date,
    responseReceived: Boolean
  }],
  messages: [{
    from: String, // 'hospital', 'contact', 'system'
    to: String,
    message: String,
    sentAt: Date,
    via: String // 'sms', 'whatsapp', 'email'
  }],
  createdAt: Date,
  resolvedAt: Date
}
```

### API Endpoints

```
POST /api/emergency/sos
- Trigger emergency SOS
- Requires: location, hospital info (optional)
- Returns: emergency event with temporary access link

GET /api/emergency/access/:token
- Access patient data via temporary token
- Returns: critical health information only

POST /api/emergency/:eventId/notify-contacts
- Send notifications to emergency contacts
- Returns: notification status

POST /api/emergency/:eventId/message
- Send message (hospital ↔ contacts)
- Returns: message confirmation

GET /api/emergency/:eventId/status
- Get current emergency event status
- Returns: event details, location, messages
```

### Security Considerations

1. **Temporary Token Security**
   - Short expiry (24-48 hours)
   - Single-use or limited access
   - Revocable by patient/contacts

2. **Data Privacy**
   - Only critical info shared during emergency
   - Patient can revoke access anytime
   - All access logged and auditable

3. **Hospital Verification** (Future)
   - Hospital registry (verified hospitals only)
   - Hospital staff authentication
   - Audit trail for all data access

### User Interface

#### Dashboard Emergency Page
- Large "Emergency SOS" button (red, prominent)
- Quick settings for emergency contacts
- Recent emergency events history
- Test SOS feature (dry run without notifications)

#### Emergency Access Page (Public)
- Landing page for temporary link
- Critical health information display
- QR code for hospital scanning
- Contact hospital button
- Share via WhatsApp button

### SMS/WhatsApp Message Templates

**SOS Alert Template:**
```
🚨 EMERGENCY ALERT 🚨

[Patient Name] needs immediate medical attention at:

📍 [Hospital Name]
[Address]
[Google Maps Link]

⏰ Time: [Timestamp]

📋 View Health Data: [Temporary Link]

💬 Hospital Contact: [Phone/WhatsApp]

Tap the link above to share health information with medical staff.
```

## Implementation Priority

**High Priority** - This addresses a critical use case mentioned in user feedback and PRD's emergency features section.

### Phase 1: MVP (Week 1-2)
- ✅ SOS trigger endpoint
- ✅ Location capture (browser Geolocation)
- ✅ SMS integration (Twilio)
- ✅ Temporary access link generation
- ✅ Basic emergency page UI

### Phase 2: Enhancement (Week 3-4)
- ✅ WhatsApp integration
- ✅ Message templates
- ✅ Two-way communication
- ✅ Emergency event history
- ✅ QR code generation

### Phase 3: Advanced (Future)
- ✅ Hospital registry/verification
- ✅ PWA features (offline, background)
- ✅ Real-time location tracking
- ✅ Integration with phone's emergency contacts

## Estimated Effort

- **Phase 1 (MVP)**: 20-30 hours
- **Phase 2 (Enhancement)**: 15-20 hours
- **Phase 3 (Advanced)**: 25-35 hours

**Total**: 60-85 hours for full implementation

