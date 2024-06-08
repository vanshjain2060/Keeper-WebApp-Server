import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
    // Grab the token from cookies
    const { token } = req.cookies;
    
    // If no token, return a 403 response
    if (!token) {
        return res.status(403).send("No token provided.");
    }

    try {
        // Decode the token to get the user data
        const decoded = jwt.verify(token, "this is our secret key");
        req.user = decoded;

        // Optionally, you can attach user data to the response object
        // but it's more conventional to just set req.user and call next()
        // return res.send(req.user);
        
        // Proceed to the next middleware or route handler
        return next();
    } catch (error) {
        // If token verification fails, send an error response
        return res.status(401).send("Invalid token.");
    }
}

export { auth };
