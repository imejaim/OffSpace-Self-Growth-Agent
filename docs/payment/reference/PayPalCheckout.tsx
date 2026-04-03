import { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

// ADDED: Vite 환경변수에서 PayPal Client ID 로드
const initialOptions = {
    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
    currency: "USD",
    intent: "capture",
};

// ADDED: PayPal 결제 버튼 컴포넌트 — 이전 프로젝트(Un-Myeong)에서 검증된 코드
// MODIFIED: Offspace에 맞게 금액/상품명을 변경해야 함 (현재 $10.00 하드코딩)
export const PayPalCheckout = () => {
    const [message, setMessage] = useState("");

    const createOrder = async () => {
        try {
            // 서버사이드 API 호출 — 주문 생성
            const response = await fetch("/api/orders/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const orderData = await response.json();

            if (orderData.id) {
                return orderData.id;
            } else {
                const errorDetail = orderData?.details?.[0];
                const errorMessage = errorDetail
                    ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
                    : JSON.stringify(orderData);

                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error(error);
            setMessage(`Could not initiate PayPal Checkout...${error}`);
            throw error;
        }
    };

    const onApprove = async (data: any, actions: any) => {
        try {
            // 서버사이드 API 호출 — 결제 캡처 (확정)
            const response = await fetch("/api/orders/capture", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    orderID: data.orderID,
                }),
            });

            const orderData = await response.json();
            const errorDetail = orderData?.details?.[0];

            if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
                // 결제 수단 거절 시 재시도
                return actions.restart();
            } else if (errorDetail) {
                throw new Error(`${errorDetail.description} (${orderData.debug_id})`);
            } else if (!orderData.purchase_units) {
                throw new Error(JSON.stringify(orderData));
            } else {
                const transaction =
                    orderData?.purchase_units?.[0]?.payments?.captures?.[0] ||
                    orderData?.purchase_units?.[0]?.payments?.authorizations?.[0];
                setMessage(`Transaction ${transaction.status}: ${transaction.id}`);
            }
        } catch (error) {
            console.error(error);
            setMessage(`Sorry, your transaction could not be processed...${error}`);
        }
    };

    return (
        <div className="paypal-checkout-container">
            <h2>결제하기</h2>
            {/* MODIFIED: Offspace 결제 상품에 맞게 아래 텍스트 변경 필요 */}
            <p>Offspace 프리미엄 서비스 ($10.00)</p>

            <PayPalScriptProvider options={initialOptions}>
                <PayPalButtons
                    style={{ layout: "vertical", shape: "rect", color: "blue", label: "pay" }}
                    createOrder={createOrder}
                    onApprove={onApprove}
                />
            </PayPalScriptProvider>

            {message && (
                <div className="payment-message">
                    <span>{message.includes('COMPLETED') ? '🎉 결제 성공!' : '🔔 알림:'}</span>
                    <br />
                    {message}
                </div>
            )}
        </div>
    );
};
