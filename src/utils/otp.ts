import smsClient from "twilio"
const client = smsClient("AC6fed047faffc888f8499a044b89fd181", "c70da7530b1ef515d1f8df363fd91838")

export const getOtp = async (otp: Number, mobile: any, message:any) => {
    const response = await client.messages.create({
        body: `Your OTP is ${otp}. ${message}`,
        to: `+91${mobile}`,
        from: '+14344438008'
    })
    console.log("OTP sent")
    return response
}
