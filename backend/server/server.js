import cors from 'cors';
import express from 'express';
import { connectToDB, db } from './db.js';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import nodemailer from "nodemailer"
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 8000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Helper functions
const validateUserData = (data) => {
  const { name, mobilenumber, dateofbirth, email, password } = data;
  if (!name || !mobilenumber || !dateofbirth || !email || !password) {
    throw new Error('All fields are required');
  }
};


app.post('/signin', async (req, res) => {
  try {
    const user = await db.collection("members").findOne({ Email: req.body.email });
    if (!user) return res.status(404).json({ error: "Email not found" });

    if (user.Password !== req.body.password) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    // Ensure user object retains capitalized fields
    res.json({ message: "Login successful", user });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: "Login failed" });
  }
});


app.post('/signup', async (req, res) => {
  try {
    // Validate user input
    const { name, mobilenumber, dateofbirth, email, password } = req.body;

    if (!name || !mobilenumber || !dateofbirth || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if the email already exists (case-sensitive)
    const existing = await db.collection('members').findOne({ Email: email });
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Create new user with capitalized keys
    const newUser = {
      Name: name,
      Mobilenumber: mobilenumber,
      DateOfBirth: dateofbirth,
      Email: email,
      Password: password
    };

    // Insert into MongoDB
    const result = await db.collection('members').insertOne(newUser);

    // Respond with success and stored user data
    res.status(201).json({
      message: 'Signup successful',
      user: newUser
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
});


// Authentication Routes
app.post('/adminsignin', async (req, res) => {
  try {
    const user = await db.collection("admin").findOne({ Email: req.body.email });
    if (!user) return res.status(404).json({ error: "Email not found" });

    if (user.Password !== req.body.password) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    // Ensure user object retains capitalized fields
    res.json({ message: "Login successful", user });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: "Login failed" });
  }
});


app.post('/adminsignup', async (req, res) => {
  try {
    // Validate user input
    const { name, mobilenumber, dateofbirth, email, password } = req.body;

    if (!name || !mobilenumber || !dateofbirth || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if the email already exists (case-sensitive)
    const existing = await db.collection('admin').findOne({ Email: email });
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Create new user with capitalized keys
    const newUser = {
      Name: name,
      Mobilenumber: mobilenumber,
      DateOfBirth: dateofbirth,
      Email: email,
      Password: password
    };

    // Insert into MongoDB
    const result = await db.collection('admin').insertOne(newUser);

    // Respond with success and stored user data
    res.status(201).json({
      message: 'Signup successful',
      user: newUser
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
});


// Event Routes
app.post('/adminevents', async (req, res) => {
  try {
    const { name, date, description, photoBase64 } = req.body;
    if (!name || !date || !description || !photoBase64) {
      throw new Error('All fields including photo are required');
    }

    const event = { name, date, description, photoBase64 };
    await db.collection('Events').insertOne(event);
    res.status(201).json({ message: "Event created", event });
  } catch (error) {
    console.error('Event creation error:', error);
    const status = error.message.includes('required') ? 400 : 500;
    res.status(status).json({ error: error.message || "Event creation failed" });
  }
});

app.get('/events', async (req, res) => {
  try {
    const events = await db.collection('Events').find().toArray();
    res.json(events); // send full event including photoBase64
  } catch (error) {
    console.error('Events fetch error:', error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});


app.get('/register/:eventId', async (req, res) => {
  const { eventId } = req.params;

  try {
    // 1. Try to find if this is a valid event ID
    let event = null;
    try {
      event = await db
        .collection('Events')
        .findOne({ _id: new ObjectId(eventId) });
    } catch (err) {
      // Not a valid ObjectId or not found
    }

    if (event) {
      return res.status(200).json(event);
    }

    // 2. If not found in Events, treat it as a userId and fetch user's registered events (tickets)
    const tickets = await db.collection('Tickets').find({ userId: eventId }).toArray();
    const populatedTickets = [];

    for (const ticket of tickets) {
      let eventDetails = null;
      try {
        eventDetails = await db.collection('Events').findOne({ _id: new ObjectId(ticket.eventId) });
      } catch (err) {
        // Event details not found
      }
      populatedTickets.push({
        _id: ticket._id,
        ticketId: ticket.ticketId,
        attendeeName: ticket.attendeeName,
        email: ticket.email,
        phone: ticket.phone,
        attendees: ticket.attendees,
        isVerified: ticket.isVerified,
        createdAt: ticket.createdAt,
        qrCodeData: ticket.qrCodeData,
        event: eventDetails || { name: 'Unknown Event', date: '', description: '', photoBase64: '' }
      });
    }

    res.status(200).json(populatedTickets);
  } catch (err) {
    console.error('Error fetching event or registration:', err);
    res.status(500).json({ error: 'Failed to fetch event details' });
  }
});


app.delete('/events/:id', async (req, res) => {
  try {
    const result = await db.collection('Events').deleteOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Event not found" });
    }
    
    res.json({ message: "Event deleted" });
  } catch (error) {
    console.error('Event deletion error:', error);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

app.put('/events/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    const { name, date, description, photoBase64 } = req.body;

    const updateFields = { name, date, description };

    if (photoBase64) {
      updateFields.photoBase64 = photoBase64; // optional update
    }

    const result = await db.collection('Events').updateOne(
      { _id: new ObjectId(eventId) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.status(200).json({ message: 'Event updated successfully' });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET - Fetch Gallery Members
app.get('/gallery', async (req, res) => {
  try {
    const members = await db.collection('gallery').find().toArray();
    res.json(members);
  } catch (error) {
    console.error('Error fetching gallery:', error);
    res.status(500).json({ error: 'Failed to fetch gallery members' });
  }
});

// POST - Create New Gallery Member
app.post('/admingallery', async (req, res) => {
  try {
    const { name, regno, role, photoBase64 } = req.body;
    
    if (!name || !regno || !photoBase64) {
      return res.status(400).json({ error: 'All fields except role are required' });
    }

    const newMember = { name, regno, role: role || 'member', photoBase64 };
    const result = await db.collection('gallery').insertOne(newMember);
    
    res.status(201).json(result.ops ? result.ops[0] : newMember);
  } catch (error) {
    console.error('Error adding gallery member:', error);
    res.status(500).json({ error: 'Failed to add gallery member' });
  }
});

// PUT - Update Gallery Member
app.put('/gallery/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, regno, role, photoBase64 } = req.body;

    if (!name || !regno) {
      return res.status(400).json({ error: 'Name and RegNo are required' });
    }

    const updatedMember = { 
      name, 
      regno, 
      role: role || 'member', 
      ...(photoBase64 && { photoBase64 }) 
    };

    const result = await db.collection('gallery').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updatedMember },
      { returnDocument: 'after' } // replaces deprecated returnOriginal
    );

    if (!result.value) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json(result.value);
  } catch (error) {
    console.error('Error updating gallery member:', error);
    res.status(500).json({ error: 'Failed to update gallery member' });
  }
});

// DELETE - Delete Gallery Member
app.delete('/gallery/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.collection('gallery').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Error deleting gallery member:', error);
    res.status(500).json({ error: 'Failed to delete gallery member' });
  }
});


app.post('/register/:userId/:eventId', async (req, res) => {
  try {
    const { userId, eventId } = req.params;
    const { name, email, phone, attendees } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 1. Check if email already has a ticket for this event
    const existingTicket = await db.collection('Tickets').findOne({
      eventId: eventId,
      email: email
    });

    if (existingTicket) {
      return res.status(409).json({ 
        error: 'A ticket has already been registered using this email for this event. Please use another email.' 
      });
    }

    // 2. Fetch event
    const event = await db.collection('Events').findOne({ _id: new ObjectId(eventId) });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // 3. Fetch user
    const user = await db.collection('members').findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate that entering email matches the registered user email
    if (user.Email.toLowerCase() !== email.toLowerCase()) {
      return res.status(403).json({ error: 'You can only register events for your own registered email address.' });
    }

    const userEmail = user.Email;

    // 4. Generate Ticket ID and QR Code
    const ticketId = `TICKET-${uuidv4().substring(0, 8).toUpperCase()}`;
    const qrCodeData = await QRCode.toDataURL(ticketId);

    // 5. Store Ticket
    const ticketData = {
      userId,
      eventId,
      ticketId,
      attendeeName: name,
      email: userEmail,
      phone,
      attendees: parseInt(attendees) || 1,
      createdAt: new Date(),
      qrCodeData,
      isVerified: false
    };

    await db.collection('Tickets').insertOne(ticketData);

    // 6. Send Email with Ticket Info
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'narendrareddy0312@gmail.com',
        pass: process.env.PASS ? process.env.PASS.replace(/\s+/g, "") : ""
      }
    });

    const base64Image = qrCodeData.replace(/^data:image\/png;base64,/, "");

    const mailOptions = {
      from: 'narendrareddy0312@gmail.com',
      to: userEmail,
      subject: `Your Ticket for ${event.name}`,
      html: `
        <h2>Hello ${name},</h2>
        <p>Thank you for registering for <strong>${event.name}</strong>.</p>
        <p><strong>Ticket ID:</strong> ${ticketId}</p>
        <p><strong>Event Date:</strong> ${event.date}</p>
        <p>Show this QR code at entry:</p>
        <img src="cid:qrcode" alt="QR Code" style="width:200px;height:200px;" />
        <br/>
        <p>Thank you!<br/>SRKR Coding Club</p>
      `,
      attachments: [{
        filename: 'qrcode.png',
        content: Buffer.from(base64Image, 'base64'),
        cid: 'qrcode'
      }]
    };

    await transporter.sendMail(mailOptions);

    // 7. Respond to frontend
    res.status(201).json({
      ...ticketData,
      eventName: event.name,
      eventDate: event.date,
      eventLocation: event.location
    });

  } catch (error) {
    console.error('Ticket generation error:', error);
    res.status(500).json({ error: 'Failed to generate or email ticket' });
  }
});




// Ticket Verification Endpoint (for event staff)
app.post('/tickets/verify', async (req, res) => {
  try {
    const { ticketId } = req.body;
    
    if (!ticketId) {
      return res.status(400).json({ error: 'Ticket ID required' });
    }

    const ticket = await db.collection('Tickets').findOne({ ticketId });
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (ticket.isVerified) {
      return res.status(400).json({ error: 'Ticket already used' });
    }

    // Mark ticket as verified
    await db.collection('Tickets').updateOne(
      { ticketId },
      { $set: { isVerified: true, verifiedAt: new Date() } }
    );

    res.json({ 
      message: 'Ticket verified successfully',
      attendeeName: ticket.attendeeName,
      attendees: ticket.attendees
    });

  } catch (error) {
    res.status(500).json({ error: 'Ticket verification failed' });
  }
});





// Get Ticket Details
app.get('/tickets/:ticketId', async (req, res) => {
  try {
    const ticket = await db.collection('Tickets').findOne({ 
      ticketId: req.params.ticketId 
    });
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const event = await db.collection('Events').findOne({ 
      _id: new ObjectId(ticket.eventId) 
    });

    res.json({
      ...ticket,
      eventName: event?.name,
      eventDate: event?.date,
      eventLocation: event?.location
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});


app.get('/profile/:id', async (req, res) => {
    try {
        console.log('Requested ID:', req.params.id);
        const user = await db.collection('members').findOne({ 
            _id: new ObjectId(req.params.id) 
        });

        if (!user) {
            console.log('User not found for ID:', req.params.id);
            return res.status(404).json({ message: 'User not found' });
        }

        const userData = {
            _id: user._id,
            name: user.Name,
            email: user.Email,
            dob: user.DateOfBirth,
            phone: user.Mobilenumber
        };

        res.json(userData);
    } catch (err) {
        console.error('Profile error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});



app.get('/adminprofile/:id', async (req, res) => {
    try {
        console.log('Requested ID:', req.params.id);
        const user = await db.collection('admin').findOne({ 
            _id: new ObjectId(req.params.id) 
        });

        if (!user) {
            console.log('User not found for ID:', req.params.id);
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const userData = {
            _id: user._id,
            name: user.Name,
            email: user.Email,
            dob: user.DateOfBirth,
            phone: user.Mobilenumber
        };

        res.json({ success: true, data: userData });
    } catch (err) {
        console.error('Profile error:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});




















connectToDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
    });
  })
  .catch(error => {
    console.error('Fatal error during startup:', error);
    process.exit(1); // Exit with failure code
  });



  