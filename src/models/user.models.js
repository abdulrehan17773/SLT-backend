    import mongoose, {Schema} from "mongoose";
    import bcrypt from "bcryptjs";
    import jwt from "jsonwebtoken";

    const userSchema = new Schema({
        
        fullname: {
            type: String,
            required: true
        },
        email:{
            type: String,
            required: true,
            tolowercase: true,
            trim: true
        },
        password:{
            type: String,
            required: true,
        },
        role: {
            type: [String],
            default: 'User'
        },
        refreshToken: {
            type: String,
        },
        resetPasswordCode: {
            type: String,
            default: null
        },
        resetPasswordExpiry: {
            type: Date,
            default: null
        },
        deletedAt: {
            type: Date,
            default: null
        }
    }, {timestamps: true});

    // just before saving the user, hash the password
    userSchema.pre("save", async function (next) {

        if(this.isModified("password")){
            // hash the password if password is modified
            this.password = await bcrypt.hash(this.password, 10)
        }
        
        next();
    })

    // compare password method
    userSchema.methods.comparePassword = async function (password) {

        // return result after compare 
        return await bcrypt.compare(password, this.password);

    }


    // generate jwt access token here
    userSchema.methods.generateAccessToken = function () {

        // return the jwt access token
        return jwt.sign(
            {
                _id: this._id,
                email: this.email,
            },
                process.env.ACCESS_TOKEN_STRING,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRY
            }
        )
    }

    // generate jwt refresh token here
    userSchema.methods.generateRefreshToken = function () {
        
        // return the jwt refresh token
        return jwt.sign(
            {
                _id: this._id,
            },
                process.env.REFRESH_TOKEN_STRING,
            {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRY
            }
        )
    }



    export const User = mongoose.model("User", userSchema);