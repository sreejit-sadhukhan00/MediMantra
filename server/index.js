import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import chalk from 'chalk';
import connectDB from './config/dbconnect.js';
import { cloudinary } from './config/cloudinary.config.js';

// Routes
import authRoutes from './routes/auth.route.js';
import patientRoutes from './routes/patient.route.js';
import doctorRoutes from './routes/doctor.route.js';
import chatbotRoutes from './routes/chatbot.route.js';
import symptomRoutes from './routes/symptom.route.js';

// Initialize
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

// Database connection
connectDB();

// API Routes
app.get('/api/health', (req, res) => res.status(200).json({ status: 'healthy' }));
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/symptom-checker', symptomRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Resource not found' 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(chalk.red.bold('🔥 ERROR:'), chalk.red(err.stack));
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start server
const server = app.listen(PORT, () => {
  const mode = process.env.NODE_ENV || 'development';
  const divider = chalk.gray('-----------------------------------');
  console.log(divider);
  console.log(chalk.blue.bold('✨ MediMantra API Server'));
  console.log(divider);
  console.log(`📡 ${chalk.yellow('Status:')}      ${chalk.green('Running')}`);
  console.log(`🌐 ${chalk.yellow('Environment:')} ${chalk.cyan(mode)}`);
  console.log(`🚪 ${chalk.yellow('Port:')}        ${chalk.cyan(PORT)}`);
  console.log(`☁️  ${chalk.yellow('Cloudinary:')}  ${chalk.cyan('Connected')}`);
  console.log(`⏱️  ${chalk.yellow('Timestamp:')}   ${chalk.cyan(new Date().toLocaleString())}`);
  console.log(divider);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(chalk.bgRed.white.bold(' UNHANDLED REJECTION '));
  console.error(`${chalk.red('❌ Error:')} ${chalk.yellow(err.name)}`);
  console.error(`${chalk.red('📝 Message:')} ${chalk.yellow(err.message)}`);
  console.log(chalk.gray('-----------------------------------'));
  server.close(() => {
    process.exit(1);
  });
});