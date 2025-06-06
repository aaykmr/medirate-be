# Hospital and Doctor Rating App

A mobile app for rating hospitals and doctors, built with React Native and Node.js.

## Backend Setup
1. Navigate to `backend/`:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with:
   ```
   MONGO_URI=mongodb://localhost:27017/hospital_rating
   JWT_SECRET=your_jwt_secret
   ```
4. Start MongoDB locally or use a cloud service like MongoDB Atlas.
5. Run the server:
   ```bash
   npm start
   ```

## Frontend Setup
1. Navigate to `frontend/`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Update `API_URL` in `frontend/src/services/api.js` to your backend URL (e.g., `http://192.168.x.x:5000/api` for local development).
4. Start the Expo development server:
   ```bash
   npm start
   ```
5. Use the Expo Go app to scan the QR code and test on a mobile device, or run on an emulator.

## Development Notes
- Ensure MongoDB is running locally or accessible via the `MONGO_URI`.
- Replace `your-local-ip` in `api.js` with your machine's IP address for mobile testing.
- Add sample data to MongoDB manually or create a seed script for testing.
- Extend the app by adding features like search, filtering, or user profiles.

## Next Steps
- Implement input validation and error handling.
- Add pagination for hospital and doctor lists.
- Enhance UI with more styling and animations.
- Deploy backend to a service like Heroku or Render.
- Publish the React Native app to app stores using Expo EAS.