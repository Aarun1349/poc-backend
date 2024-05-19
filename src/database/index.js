import mongoose from "mongoose";
import { DB_NAME } from "../constants/index.js"
const connectToDB = async () => {

  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}${DB_NAME}`
    );
     console.log(`\n MONGODB Connected !! DB HOST:=>`,connectionInstance.connection.host);
  } catch (error) {
    console.log(`MONGODB Connection Error: ${error.message}`);
  }
};

export default connectToDB;