import { toast } from "react-hot-toast";
import { studentEndpoints } from "../apis";
import { apiConnector } from "../apiconnector";
import rzpLogo from "../../assets/Logo/rzp_logo.png"
import { setPaymentLoading } from "../../slices/courseSlice";
import { resetCart } from "../../slices/cartSlice";


const {COURSE_PAYMENT_API, COURSE_VERIFY_API, SEND_PAYMENT_SUCCESS_EMAIL_API} = studentEndpoints;

function loadScript(src) {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = src;

        script.onload = () => {
            resolve(true);
        }
        script.onerror= () =>{
            resolve(false);
        }
        document.body.appendChild(script);
    })
}


export async function buyCourse(token, courses, userDetails, navigate, dispatch) {
    const toastId = toast.loading("Loading...");
    try {
        // Load the Razorpay SDK
        const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
        if (!res) {
            toast.error("RazorPay SDK failed to load");
            return;
        }

        // Initiate the order
        const orderResponse = await apiConnector(
            "POST", 
            COURSE_PAYMENT_API,
            {
                courses: Array.isArray(courses) ? courses : [courses]
            },
            {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        );

        console.log("Order Response:", orderResponse);

        if (!orderResponse.data.success) {
            throw new Error(orderResponse.data.message || "Could not create order");
        }

        const { amount, currency, orderId } = orderResponse.data.message;

        // Configure Razorpay options
        const options = {
            key: "rzp_test_M1kfbj6xrNnFyJ",
            amount: amount,
            currency: currency || "INR",
            name: "SkillMart",
            description: "Course Purchase",
            image: rzpLogo,
            order_id: orderId,
            prefill: {
                name: userDetails.firstName,
                email: userDetails.email
            },
            handler: async function(response) {
                try {
                    // Verify payment first
                    await verifyPayment(
                        {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            courses: Array.isArray(courses) ? courses : [courses]
                        }, 
                        token, 
                        navigate, 
                        dispatch
                    );

                    // If verification successful, send email
                    await sendPaymentSuccessEmail(
                        {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id
                        }, 
                        amount, 
                        token
                    );
                } catch (error) {
                    console.error("Payment completion error:", error);
                    toast.error("Payment verification failed");
                }
            },
            modal: {
                ondismiss: function() {
                    toast.error("Payment cancelled");
                }
            }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.on("payment.failed", function(response) {
            toast.error(response.error.description || "Payment failed");
        });
        paymentObject.open();

    } catch (error) {
        console.error("Payment Error:", error);
        toast.error(error.message || "Could not initiate payment");
    } finally {
        toast.dismiss(toastId);
    }
}

async function sendPaymentSuccessEmail(response, amount, token) {
    try{
        await apiConnector("POST", SEND_PAYMENT_SUCCESS_EMAIL_API, {
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            amount,
        },{
            Authorization: `Bearer ${token}`
        })
    }
    catch(error) {
        console.log("PAYMENT SUCCESS EMAIL ERROR....", error);
    }
}

//verify payment
async function verifyPayment(bodyData, token, navigate, dispatch) {
    const toastId = toast.loading("Verifying Payment....");
    dispatch(setPaymentLoading(true));
    try{
        const response  = await apiConnector("POST", COURSE_VERIFY_API, bodyData, {
            Authorization:`Bearer ${token}`,
        })

        if(!response.data.success) {
            throw new Error(response.data.message);
        }
        toast.success("payment Successful, ypou are addded to the course");
        navigate("/dashboard/enrolled-courses");
        dispatch(resetCart());
    }   
    catch(error) {
        console.log("PAYMENT VERIFY ERROR....", error);
        toast.error("Could not verify Payment");
    }
    toast.dismiss(toastId);
    dispatch(setPaymentLoading(false));
}