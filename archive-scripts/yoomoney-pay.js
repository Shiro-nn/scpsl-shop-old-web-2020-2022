router.get('/api/ym-pay/:payId', vhost(host, async(req, res) => {
	if (!req.params.payId || req.params.payId == 'null' || req.params.payId == 'undefined') {
		res.send('<script>history.back();</script>');
		return;
	}

	const payData = await paymentsData.findById(req.params.payId);

	if (!payData) {
		res.send('<script>history.back();</script>');
		return;
	}

	const YMPay = YMList[payData.payId];
	if (!YMPay) {
		res.send('<script>history.back();</script>');
		return;
	}
	
	let sum = payData.sum;

	if(YMPay.min > sum){
		payData.sum = YMPay.min;
		sum = payData.sum;
		await payData.save();
	}

	if(YMPay.comms > 0){
		sum = sum + (sum * YMPay.comms / 100);
	}

	res.send(`
<html style="background:black">
<form method="POST" action="https://yoomoney.ru/quickpay/confirm">
    <input type="hidden" name="receiver" value="${config.yoomoney.wallet}"/>
    <input type="hidden" name="label" value="${payData._id}"/>
    <input type="hidden" name="quickpay-form" value="button"/>
    <input type="hidden" name="sum" value="${sum}" data-type="number"/>
    <input type="hidden" name="paymentType" value="${YMPay.type}"/>
    <input type="hidden" name="successURL" value="https://${config.dashboard.baseURL}/profile"/>
    <input type="submit" value="Нажми, если не нажалось автоматически"/>
</form>
<script>
document.querySelector('input[type="submit"]').click();
</script>
</html>`)
}));