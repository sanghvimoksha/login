const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

mongoose.connect('mongodb://localhost:27017/taxpal', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.post('/signup', async (req, res) => {
  const { name, email, password, confirm } = req.body;
  if (password !== confirm) return res.status(400).send('Passwords do not match');
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(201).send('User registered');
  } catch (err) {
    res.status(400).send('Email already exists');
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).send('No user found');
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).send('Invalid password');
  res.status(200).send('Login successful');
});

app.listen(3000, () => console.log('Server running on port 3000'));
