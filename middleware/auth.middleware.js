import jwt from "jsonwebtoken";


const authenticate = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }
    try {
      const decoded = jwt.verify(token, "this is our secret key");
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: "Invalid token" });
    }
  };
export { authenticate };
