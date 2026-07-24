const jwt = require("jsonwebtoken");

const SECRET_KEY = "SPMS_SECRET_KEY";    
function authMiddleware(req, res, next) {

  const authHeader = req.headers.authorization; //when login, you get a token

  if (!authHeader) {
    return res.status(401).json({
      error: true,
      message: "No token provided"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();        
  } catch (error) {
    return res.status(403).json({
      error: true,
      message: "Invalid or expired token"
    });
  }
}

module.exports = { authMiddleware };
