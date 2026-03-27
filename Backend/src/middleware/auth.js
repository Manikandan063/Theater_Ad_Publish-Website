import jwt from 'jsonwebtoken';

export const protect = (role = []) => {
    return async (req, res, next) => {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            try {
                token = req.headers.authorization.split(' ')[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                
                req.user = decoded;

                // Simple Role check - role can be a string or an array of roles
                const authorizedRoles = Array.isArray(role) ? role : [role];

                if (authorizedRoles.length > 0 && !authorizedRoles.includes(req.user.role)) {
                    return res.status(403).json({ success: false, message: 'Unauthorized role' });
                }

                next();
            } catch (error) {
                console.error(error);
                res.status(401).json({ success: false, message: 'Not authorized, token failed' });
            }
        }

        if (!token) {
            res.status(401).json({ success: false, message: 'Not authorized, no token' });
        }
    };
};
