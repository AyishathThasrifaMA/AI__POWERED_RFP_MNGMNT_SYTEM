const express = require("express");
const cors = require("cors"); 
require("dotenv").config();
const sequelize = require("./config/db");

const rfpRoutes = require("./routes/rfpRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const proposalRoutes = require("./routes/proposalRoutes");

const emailSendRoutes = require("./routes/emailSendRoutes");
const emailReceiveRoutes = require("./routes/emailReceiveRoutes");

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" })); 

app.use("/api/rfps", rfpRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/email", emailSendRoutes);    
app.use("/api/email", emailReceiveRoutes);  

app.get("/", (req, res) => {
  res.send("AI RFP Backend is running with Sequelize + PostgreSQL + Email System");
});

const PORT = process.env.PORT || 5000;

sequelize
  .authenticate()
  .then(() => {
    console.log("✅ PostgreSQL Connected Successfully via Sequelize");
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log("🛠 Database Synced");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
  });

