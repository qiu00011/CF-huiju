// 部署完成后在网址后面加上这个，获取自建节点和机场聚合节点，/?token=auto或/auto或

let mytoken = 'auto';
let guestToken = ''; //可以随便取，或者uuid生成，https://1024tools.com/uuid
let BotToken = ''; //可以为空，或者@BotFather中输入/start，/newbot，并关注机器人
let ChatID = ''; //可以为空，或者@userinfobot中获取，/start
let TG = 0; //小白勿动， 开发者专用，1 为推送所有的访问信息，0 为不推送订阅转换后端的访问信息与异常访问
let FileName = 'CF-Workers-SUB';
let SUBUpdateTime = 6; //自定义订阅更新时间，单位小时
let total = 99;//TB
let timestamp = 4102329600000;//2099-12-31

//节点链接 + 订阅链接
let MainData = `
https://cfxr.eu.org/getSub
`;

let urls = [];
let subConverter = "SUBAPI.cmliussss.net"; //在线订阅转换后端，目前使用CM的订阅转换功能。支持自建psub 可自行搭建https://github.com/bulianglin/psub
let subConfig = "https://raw.githubusercontent.com/cmliu/ACL4SSR/main/Clash/config/ACL4SSR_Online_MultiCountry.ini"; //订阅配置文件
let subProtocol = 'https';

export default {
	async fetch(request, env) {
		const userAgentHeader = request.headers.get('User-Agent');
		const userAgent = userAgentHeader ? userAgentHeader.toLowerCase() : "null";
		const url = new URL(request.url);
		const token = url.searchParams.get('token');
		mytoken = env.TOKEN || mytoken;
		BotToken = env.TGTOKEN || BotToken;
		ChatID = env.TGID || ChatID;
		TG = env.TG || TG;
		subConverter = env.SUBAPI || subConverter;
		if (subConverter.includes("http://")) {
			subConverter = subConverter.split("//")[1];
			subProtocol = 'http';
		} else {
			subConverter = subConverter.split("//")[1] || subConverter;
		}
		subConfig = env.SUBCONFIG || subConfig;
		FileName = env.SUBNAME || FileName;

		const currentDate = new Date();
		currentDate.setHours(0, 0, 0, 0);
		const timeTemp = Math.ceil(currentDate.getTime() / 1000);
		const fakeToken = await MD5MD5(`${mytoken}${timeTemp}`);
		guestToken = env.GUESTTOKEN || env.GUEST || guestToken;
		if (!guestToken) guestToken = await MD5MD5(mytoken);
		const 访客订阅 = guestToken;

		let UD = Math.floor(((timestamp - Date.now()) / timestamp * total * 1099511627776) / 2);
		total = total * 1099511627776;
		let expire = Math.floor(timestamp / 1000);
		SUBUpdateTime = env.SUBUPTIME || SUBUpdateTime;

		if (!([mytoken, fakeToken, 访客订阅].includes(token) || url.pathname == ("/" + mytoken) || url.pathname.includes("/" + mytoken + "?"))) {
			if (TG == 1 && url.pathname !== "/" && url.pathname !== "/favicon.ico") await sendMessage(`#异常访问 ${FileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${userAgent}</tg-spoiler>\n域名: ${url.hostname}\n<tg-spoiler>入口: ${url.pathname + url.search}</tg-spoiler>`);
			if (env.URL302) return Response.redirect(env.URL302, 302);
			else if (env.URL) return await proxyURL(env.URL, url);
			else return new Response(await nginx(), {
				status: 200,
				headers: {
					'Content-Type': 'text/html; charset=UTF-8',
				},
			});
		} else {
			if (env.KV) {
				await 迁移地址列表(env, 'LINK.txt');
				if (userAgent.includes('mozilla') && !url.search) {
					await sendMessage(`#编辑订阅 ${FileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${userAgentHeader}</tg-spoiler>\n域名: ${url.hostname}\n<tg-spoiler>入口: ${url.pathname + url.search}</tg-spoiler>`);
					return await KV(request, env, 'LINK.txt', 访客订阅);
				} else {
					MainData = await env.KV.get('LINK.txt') || MainData;
				}
			} else {
				MainData = env.LINK || MainData;
				if (env.LINKSUB) urls = await ADD(env.LINKSUB);
			}
			let 重新汇总所有链接 = await ADD(MainData + '\n' + urls.join('\n'));
			let 自建节点 = "";
			let 订阅链接 = "";
			for (let x of 重新汇总所有链接) {
				if (x.toLowerCase().startsWith('http')) {
					订阅链接 += x + '\n';
				} else {
					自建节点 += x + '\n';
				}
			}
			MainData = 自建节点;
			urls = await ADD(订阅链接);
			await sendMessage(`#获取订阅 ${FileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${userAgentHeader}</tg-spoiler>\n域名: ${url.hostname}\n<tg-spoiler>入口: ${url.pathname + url.search}</tg-spoiler>`);
			const isSubConverterRequest = request.headers.get('subconverter-request') || request.headers.get('subconverter-version') || userAgent.includes('subconverter');
			let 订阅格式 = 'base64';
			if (!(userAgent.includes('null') || isSubConverterRequest || userAgent.includes('nekobox') || userAgent.includes(('CF-Workers-SUB').toLowerCase()))) {
				if (userAgent.includes('sing-box') || userAgent.includes('singbox') || url.searchParams.has('sb') || url.searchParams.has('singbox')) {
					订阅格式 = 'singbox';
				} else if (userAgent.includes('surge') || url.searchParams.has('surge')) {
					订阅格式 = 'surge';
				} else if (userAgent.includes('quantumult') || url.searchParams.has('quanx')) {
					订阅格式 = 'quanx';
				} else if (userAgent.includes('loon') || url.searchParams.has('loon')) {
					订阅格式 = 'loon';
				} else if (userAgent.includes('clash') || userAgent.includes('meta') || userAgent.includes('mihomo') || url.searchParams.has('clash')) {
					订阅格式 = 'clash';
				}
			}

			let subConverterUrl;
			let 订阅转换URL = `${url.origin}/${await MD5MD5(fakeToken)}?token=${fakeToken}`;
			let req_data = MainData;

			let 追加UA = 'v2rayn';
			if (url.searchParams.has('b64') || url.searchParams.has('base64')) 订阅格式 = 'base64';
			else if (url.searchParams.has('clash')) 追加UA = 'clash';
			else if (url.searchParams.has('singbox')) 追加UA = 'singbox';
			else if (url.searchParams.has('surge')) 追加UA = 'surge';
			else if (url.searchParams.has('quanx')) 追加UA = 'Quantumult%20X';
			else if (url.searchParams.has('loon')) 追加UA = 'Loon';

			const 订阅链接数组 = [...new Set(urls)].filter(item => item?.trim?.());
			if (订阅链接数组.length > 0) {
				const 请求订阅响应内容 = await getSUB(订阅链接数组, request, 追加UA, userAgentHeader);
				console.log(请求订阅响应内容);
				req_data += 请求订阅响应内容[0].join('\n');
				订阅转换URL += "|" + 请求订阅响应内容[1];
				if (订阅格式 == 'base64' && !isSubConverterRequest && 请求订阅响应内容[1].includes('://')) {
					subConverterUrl = `${subProtocol}://${subConverter}/sub?target=mixed&url=${encodeURIComponent(请求订阅响应内容[1])}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
					try {
						const subConverterResponse = await fetch(subConverterUrl, { headers: { 'User-Agent': 'v2rayN/CF-Workers-SUB  (https://github.com/cmliu/CF-Workers-SUB)' } });
						if (subConverterResponse.ok) {
							const subConverterContent = await subConverterResponse.text();
							req_data += '\n' + atob(subConverterContent);
						}
					} catch (error) {
						console.log('订阅转换请回base64失败，检查订阅转换后端是否正常运行');
					}
				}
			}

			if (env.WARP) 订阅转换URL += "|" + (await ADD(env.WARP)).join("|");
			const utf8Encoder = new TextEncoder();
			const encodedData = utf8Encoder.encode(req_data);
			const utf8Decoder = new TextDecoder();
			const text = utf8Decoder.decode(encodedData);

			const uniqueLines = new Set(text.split('\n'));
			const result = [...uniqueLines].join('\n');

			let base64Data;
			try {
				base64Data = btoa(result);
			} catch (e) {
				function encodeBase64(data) {
					const binary = new TextEncoder().encode(data);
					let base64 = '';
					const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

					for (let i = 0; i < binary.length; i += 3) {
						const byte1 = binary[i];
						const byte2 = binary[i + 1] || 0;
						const byte3 = binary[i + 2] || 0;

						base64 += chars[byte1 >> 2];
						base64 += chars[((byte1 & 3) << 4) | (byte2 >> 4)];
						base64 += chars[((byte2 & 15) << 2) | (byte3 >> 6)];
						base64 += chars[byte3 & 63];
					}

					const padding = 3 - (binary.length % 3 || 3);
					return base64.slice(0, base64.length - padding) + '=='.slice(0, padding);
				}

				base64Data = encodeBase64(result)
			}

			const responseHeaders = {
				"content-type": "text/plain; charset=utf-8",
				"Profile-Update-Interval": `${SUBUpdateTime}`,
				"Profile-web-page-url": request.url.includes('?') ? request.url.split('?')[0] : request.url,
			};

			if (订阅格式 == 'base64' || token == fakeToken) {
				return new Response(base64Data, { headers: responseHeaders });
			} else if (订阅格式 == 'clash') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=clash&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
			} else if (订阅格式 == 'singbox') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=singbox&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
			} else if (订阅格式 == 'surge') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=surge&ver=4&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
			} else if (订阅格式 == 'quanx') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=quanx&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&udp=true`;
			} else if (订阅格式 == 'loon') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=loon&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false`;
			}
			try {
				const subConverterResponse = await fetch(subConverterUrl, { headers: { 'User-Agent': userAgentHeader } });
				if (!subConverterResponse.ok) return new Response(base64Data, { headers: responseHeaders });
				let subConverterContent = await subConverterResponse.text();
				if (订阅格式 == 'clash') subConverterContent = await clashFix(subConverterContent);
				if (!userAgent.includes('mozilla')) responseHeaders["Content-Disposition"] = `attachment; filename*=utf-8''${encodeURIComponent(FileName)}`;
				return new Response(subConverterContent, { headers: responseHeaders });
			} catch (error) {
				return new Response(base64Data, { headers: responseHeaders });
			}
		}
	}
};

async function ADD(envadd) {
	var addtext = envadd.replace(/[	"'|\r\n]+/g, '\n').replace(/\n+/g, '\n');
	if (addtext.charAt(0) == '\n') addtext = addtext.slice(1);
	if (addtext.charAt(addtext.length - 1) == '\n') addtext = addtext.slice(0, addtext.length - 1);
	const add = addtext.split('\n');
	return add;
}

async function nginx() {
	const text = `
	<!DOCTYPE html>
	<html>
	<head>
	<title>Welcome to nginx!</title>
	<style>
		body {
			width: 35em;
			margin: 0 auto;
			font-family: Tahoma, Verdana, Arial, sans-serif;
		}
	</style>
	</head>
	<body>
	<h1>Welcome to nginx!</h1>
	<p>If you see this page, the nginx web server is successfully installed and
	working. Further configuration is required.</p>
	
	<p>For online documentation and support please refer to
	<a href="http://nginx.org/">nginx.org</a>.<br/>
	Commercial support is available at
	<a href="http://nginx.com/">nginx.com</a>.</p>
	
	<p><em>Thank you for using nginx.</em></p>
	</body>
	</html>
	`
	return text;
}

async function sendMessage(type, ip, add_data = "") {
	if (BotToken !== '' && ChatID !== '') {
		let msg = "";
		const response = await fetch(`http://ip-api.com/json/${ip}?lang=zh-CN`);
		if (response.status == 200) {
			const ipInfo = await response.json();
			msg = `${type}\nIP: ${ip}\n国家: ${ipInfo.country}\n<tg-spoiler>城市: ${ipInfo.city}\n组织: ${ipInfo.org}\nASN: ${ipInfo.as}\n${add_data}`;
		} else {
			msg = `${type}\nIP: ${ip}\n<tg-spoiler>${add_data}`;
		}

		let url = "https://api.telegram.org/bot" + BotToken + "/sendMessage?chat_id=" + ChatID + "&parse_mode=HTML&text=" + encodeURIComponent(msg);
		return fetch(url, {
			method: 'get',
			headers: {
				'Accept': 'text/html,application/xhtml+xml,application/xml;',
				'Accept-Encoding': 'gzip, deflate, br',
				'User-Agent': 'Mozilla/5.0 Chrome/90.0.4430.72'
			}
		});
	}
}

function base64Decode(str) {
	const bytes = new Uint8Array(atob(str).split('').map(c => c.charCodeAt(0)));
	const decoder = new TextDecoder('utf-8');
	return decoder.decode(bytes);
}

async function MD5MD5(text) {
	const encoder = new TextEncoder();

	const firstPass = await crypto.subtle.digest('MD5', encoder.encode(text));
	const firstPassArray = Array.from(new Uint8Array(firstPass));
	const firstHex = firstPassArray.map(b => b.toString(16).padStart(2, '0')).join('');

	const secondPass = await crypto.subtle.digest('MD5', encoder.encode(firstHex.slice(7, 27)));
	const secondPassArray = Array.from(new Uint8Array(secondPass));
	const secondHex = secondPassArray.map(b => b.toString(16).padStart(2, '0')).join('');

	return secondHex.toLowerCase();
}

function clashFix(content) {
	if (content.includes('wireguard') && !content.includes('remote-dns-resolve')) {
		let lines;
		if (content.includes('\r\n')) {
			lines = content.split('\r\n');
		} else {
			lines = content.split('\n');
		}

		let result = "";
		for (let line of lines) {
			if (line.includes('type: wireguard')) {
				const 备改内容 = `, mtu: 1280, udp: true`;
				const 正确内容 = `, mtu: 1280, remote-dns-resolve: true, udp: true`;
				result += line.replace(new RegExp(备改内容, 'g'), 正确内容) + '\n';
			} else {
				result += line + '\n';
			}
		}

		content = result;
	}
	return content;
}

async function proxyURL(proxyURL, url) {
	const URLs = await ADD(proxyURL);
	const fullURL = URLs[Math.floor(Math.random() * URLs.length)];

	let parsedURL = new URL(fullURL);
	console.log(parsedURL);
	let URLProtocol = parsedURL.protocol.slice(0, -1) || 'https';
	let URLHostname = parsedURL.hostname;
	let URLPathname = parsedURL.pathname;
	let URLSearch = parsedURL.search;

	if (URLPathname.charAt(URLPathname.length - 1) == '/') {
		URLPathname = URLPathname.slice(0, -1);
	}
	URLPathname += url.pathname;

	let newURL = `${URLProtocol}://${URLHostname}${URLPathname}${URLSearch}`;

	let response = await fetch(newURL);

	let newResponse = new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: response.headers
	});

	newResponse.headers.set('X-New-URL', newURL);

	return newResponse;
}

async function getSUB(api, request, 追加UA, userAgentHeader) {
	if (!api || api.length === 0) {
		return [];
	} else api = [...new Set(api)];
	let newapi = "";
	let 订阅转换URLs = "";
	let 异常订阅 = "";
	const controller = new AbortController();
	const timeout = setTimeout(() => {
		controller.abort();
	}, 2000);

	try {
		const responses = await Promise.allSettled(api.map(apiUrl => getUrl(request, apiUrl, 追加UA, userAgentHeader).then(response => response.ok ? response.text() : Promise.reject(response))));

		const modifiedResponses = responses.map((response, index) => {
			if (response.status === 'rejected') {
				const reason = response.reason;
				if (reason && reason.name === 'AbortError') {
					return {
						status: '超时',
						value: null,
						apiUrl: api[index]
					};
				}
				console.error(`请求失败: ${api[index]}, 错误信息: ${reason.status} ${reason.statusText}`);
				return {
					status: '请求失败',
					value: null,
					apiUrl: api[index]
				};
			}
			return {
				status: response.status,
				value: response.value,
				apiUrl: api[index]
			};
		});

		console.log(modifiedResponses);

		for (const response of modifiedResponses) {
			if (response.status === 'fulfilled') {
				const content = await response.value || 'null';
				if (content.includes('proxies:')) {
					订阅转换URLs += "|" + response.apiUrl;
				} else if (content.includes('outbounds"') && content.includes('inbounds"')) {
					订阅转换URLs += "|" + response.apiUrl;
				} else if (content.includes('://')) {
					newapi += content + '\n';
				} else if (isValidBase64(content)) {
					newapi += base64Decode(content) + '\n';
				} else {
					const 异常订阅LINK = `trojan://CMLiussss@127.0.0.1:8888?security=tls&allowInsecure=1&type=tcp&headerType=none#%E5%BC%82%E5%B8%B8%E8%AE%A2%E9%98%85%20${response.apiUrl.split('://')[1].split('/')[0]}`;
					console.log('异常订阅: ' + 异常订阅LINK);
					异常订阅 += `${异常订阅LINK}\n`;
				}
			}
		}
	} catch (error) {
		console.error(error);
	} finally {
		clearTimeout(timeout);
	}

	const 订阅内容 = await ADD(newapi + 异常订阅);
	return [订阅内容, 订阅转换URLs];
}

async function getUrl(request, targetUrl, 追加UA, userAgentHeader) {
	const newHeaders = new Headers(request.headers);
	newHeaders.set("User-Agent", `${atob('djJyYXlOLzYuNDU=')} cmliu/CF-Workers-SUB ${追加UA}(${userAgentHeader})`);

	const modifiedRequest = new Request(targetUrl, {
		method: request.method,
		headers: newHeaders,
		body: request.method === "GET" ? null : request.body,
		redirect: "follow",
		cf: {
			insecureSkipVerify: true,
			allowUntrusted: true,
			validateCertificate: false
		}
	});

	console.log(`请求URL: ${targetUrl}`);
	console.log(`请求头: ${JSON.stringify([...newHeaders])}`);
	console.log(`请求方法: ${request.method}`);
	console.log(`请求体: ${request.method === "GET" ? null : request.body}`);

	return fetch(modifiedRequest);
}

function isValidBase64(str) {
	const cleanStr = str.replace(/\s/g, '');
	const base64Regex = /^[A-Za-z0-9+/=]+$/;
	return base64Regex.test(cleanStr);
}

async function 迁移地址列表(env, txt = 'ADD.txt') {
	const 旧数据 = await env.KV.get(`/${txt}`);
	const 新数据 = await env.KV.get(txt);

	if (旧数据 && !新数据) {
		await env.KV.put(txt, 旧数据);
		await env.KV.delete(`/${txt}`);
		return true;
	}
	return false;
}

async function KV(request, env, txt = 'ADD.txt', guest) {
	const url = new URL(request.url);
	try {
		if (request.method === "POST") {
			if (!env.KV) return new Response("未绑定KV空间", { status: 400 });
			try {
				const content = await request.text();
				await env.KV.put(txt, content);
				return new Response("保存成功");
			} catch (error) {
				console.error('保存KV时发生错误:', error);
				return new Response("保存失败: " + error.message, { status: 500 });
			}
		}

		let content = '';
		let hasKV = !!env.KV;

		if (hasKV) {
			try {
				content = await env.KV.get(txt) || '';
			} catch (error) {
				console.error('读取KV时发生错误:', error);
				content = '读取数据时发生错误: ' + error.message;
			}
		}

		const html = `
			<!DOCTYPE html>
			<html lang="zh-CN">
				<head>
					<title>${FileName} 订阅管理</title>
					<meta charset="utf-8">
					<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
					<style>
						* {
							margin: 0;
							padding: 0;
							box-sizing: border-box;
						}
						
						:root {
							--glass-bg: rgba(255, 255, 255, 0.1);
							--glass-border: rgba(255, 255, 255, 0.18);
							--glass-shadow: rgba(0, 0, 0, 0.1);
							--primary-color: #007AFF;
							--success-color: #34C759;
							--warning-color: #FF9500;
							--danger-color: #FF3B30;
						}
						
						body {
							font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
							background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
							min-height: 100vh;
							padding: 20px;
							overflow-x: hidden;
						}
						
						/* 动态背景 */
						body::before {
							content: '';
							position: fixed;
							top: 0;
							left: 0;
							right: 0;
							bottom: 0;
							background: 
								radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
								radial-gradient(circle at 80% 80%, rgba(138, 73, 244, 0.3) 0%, transparent 50%),
								radial-gradient(circle at 40% 20%, rgba(255, 95, 109, 0.3) 0%, transparent 50%);
							animation: gradientShift 15s ease infinite;
							pointer-events: none;
							z-index: 0;
						}
						
						@keyframes gradientShift {
							0%, 100% { opacity: 1; transform: scale(1); }
							50% { opacity: 0.8; transform: scale(1.1); }
						}
						
						.container {
							max-width: 1000px;
							margin: 0 auto;
							position: relative;
							z-index: 1;
						}
						
						/* 玻璃态卡片 */
						.glass-card {
							background: rgba(255, 255, 255, 0.08);
							backdrop-filter: blur(20px) saturate(180%);
							-webkit-backdrop-filter: blur(20px) saturate(180%);
							border-radius: 24px;
							border: 1px solid rgba(255, 255, 255, 0.18);
							box-shadow: 
								0 8px 32px 0 rgba(0, 0, 0, 0.15),
								inset 0 1px 0 0 rgba(255, 255, 255, 0.1);
							padding: 32px;
							margin-bottom: 24px;
							animation: fadeInUp 0.6s ease-out;
						}
						
						@keyframes fadeInUp {
							from {
								opacity: 0;
								transform: translateY(30px);
							}
							to {
								opacity: 1;
								transform: translateY(0);
							}
						}
						
						.header {
							text-align: center;
							margin-bottom: 40px;
							animation: fadeInUp 0.6s ease-out 0.1s both;
						}
						
						.header h1 {
							font-size: 42px;
							font-weight: 700;
							background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%);
							-webkit-background-clip: text;
							-webkit-text-fill-color: transparent;
							background-clip: text;
							margin-bottom: 12px;
							letter-spacing: -0.5px;
						}
						
						.header p {
							color: rgba(255, 255, 255, 0.8);
							font-size: 16px;
							font-weight: 400;
						}
						
						.section-title {
							font-size: 22px;
							font-weight: 600;
							color: white;
							margin-bottom: 20px;
							display: flex;
							align-items: center;
							gap: 10px;
						}
						
						.section-title::before {
							content: '';
							width: 4px;
							height: 24px;
							background: linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.5) 100%);
							border-radius: 2px;
						}
						
						/* 订阅链接卡片 */
						.sub-item {
							background: rgba(255, 255, 255, 0.06);
							backdrop-filter: blur(10px);
							border-radius: 16px;
							padding: 20px;
							margin-bottom: 16px;
							border: 1px solid rgba(255, 255, 255, 0.12);
							transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
							animation: fadeInUp 0.6s ease-out calc(var(--index) * 0.05s) both;
						}
						
						.sub-item:hover {
							transform: translateY(-4px);
							background: rgba(255, 255, 255, 0.1);
							box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
						}
						
						.sub-label {
							font-size: 14px;
							font-weight: 600;
							color: rgba(255, 255, 255, 0.9);
							margin-bottom: 8px;
							display: flex;
							align-items: center;
							gap: 8px;
						}
						
						.sub-label::before {
							content: '●';
							color: #34C759;
							font-size: 12px;
						}
						
						.sub-link {
							display: flex;
							align-items: center;
							gap: 12px;
							background: rgba(0, 0, 0, 0.2);
							padding: 12px 16px;
							border-radius: 12px;
							border: 1px solid rgba(255, 255, 255, 0.08);
							margin-bottom: 12px;
						}
						
						.sub-link a {
							flex: 1;
							color: rgba(255, 255, 255, 0.95);
							text-decoration: none;
							font-size: 13px;
							word-break: break-all;
							font-family: 'SF Mono', Monaco, monospace;
							transition: color 0.2s;
						}
						
						.sub-link a:hover {
							color: #fff;
						}
						
						/* 现代按钮 */
						.btn {
							padding: 10px 20px;
							border-radius: 12px;
							border: none;
							font-size: 14px;
							font-weight: 600;
							cursor: pointer;
							transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
							backdrop-filter: blur(10px);
							position: relative;
							overflow: hidden;
						}
						
						.btn::before {
							content: '';
							position: absolute;
							top: 50%;
							left: 50%;
							width: 0;
							height: 0;
							border-radius: 50%;
							background: rgba(255, 255, 255, 0.2);
							transform: translate(-50%, -50%);
							transition: width 0.6s, height 0.6s;
						}
						
						.btn:active::before {
							width: 300px;
							height: 300px;
						}
						
						.btn-primary {
							background: linear-gradient(135deg, #007AFF 0%, #0051D5 100%);
							color: white;
							box-shadow: 0 4px 15px rgba(0, 122, 255, 0.4);
						}
						
						.btn-primary:hover {
							transform: translateY(-2px);
							box-shadow: 0 6px 20px rgba(0, 122, 255, 0.5);
						}
						
						.btn-copy {
							background: rgba(255, 255, 255, 0.15);
							color: white;
							padding: 8px 16px;
							font-size: 13px;
							flex-shrink: 0;
						}
						
						.btn-copy:hover {
							background: rgba(255, 255, 255, 0.25);
							transform: scale(1.05);
						}
						
						.btn-success {
							background: linear-gradient(135deg, #34C759 0%, #30A14E 100%);
							color: white;
						}
						
						/* 二维码容器 */
						.qrcode-wrapper {
							margin-top: 12px;
							padding: 16px;
							background: white;
							border-radius: 12px;
							display: inline-block;
							box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
						}
						
						/* 文本编辑器 */
						.editor {
							width: 100%;
							min-height: 350px;
							padding: 20px;
							background: rgba(0, 0, 0, 0.3);
							backdrop-filter: blur(10px);
							border: 1px solid rgba(255, 255, 255, 0.15);
							border-radius: 16px;
							color: #fff;
							font-size: 14px;
							font-family: 'SF Mono', Monaco, Consolas, monospace;
							line-height: 1.6;
							resize: vertical;
							transition: all 0.3s;
						}
						
						.editor:focus {
							outline: none;
							border-color: rgba(0, 122, 255, 0.6);
							box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.1);
							background: rgba(0, 0, 0, 0.4);
						}
						
						.editor::placeholder {
							color: rgba(255, 255, 255, 0.4);
						}
						
						/* 信息框 */
						.info-box {
							background: rgba(0, 122, 255, 0.15);
							border-left: 4px solid #007AFF;
							padding: 16px 20px;
							border-radius: 12px;
							margin: 16px 0;
							backdrop-filter: blur(10px);
						}
						
						.info-box p {
							color: rgba(255, 255, 255, 0.9);
							margin: 6px 0;
							font-size: 14px;
						}
						
						.info-box strong {
							color: white;
							font-weight: 600;
						}
						
						/* 保存状态 */
						.save-container {
							display: flex;
							align-items: center;
							gap: 16px;
							margin-top: 16px;
						}
						
						.save-status {
							color: rgba(255, 255, 255, 0.8);
							font-size: 14px;
							font-weight: 500;
						}
						
						/* 折叠区域 */
						.collapsible {
							margin-top: 24px;
						}
						
						.collapse-toggle {
							color: #007AFF;
							cursor: pointer;
							font-weight: 600;
							font-size: 15px;
							display: inline-flex;
							align-items: center;
							gap: 8px;
							padding: 10px 16px;
							background: rgba(0, 122, 255, 0.1);
							border-radius: 10px;
							transition: all 0.3s;
						}
						
						.collapse-toggle:hover {
							background: rgba(0, 122, 255, 0.2);
							transform: translateX(4px);
						}
						
						.collapse-content {
							margin-top: 20px;
							padding: 24px;
							background: rgba(0, 0, 0, 0.2);
							border-radius: 16px;
							border: 1px solid rgba(255, 255, 255, 0.1);
							animation: slideDown 0.3s ease-out;
						}
						
						@keyframes slideDown {
							from {
								opacity: 0;
								transform: translateY(-10px);
							}
							to {
								opacity: 1;
								transform: translateY(0);
							}
						}
						
						/* 警告提示 */
						.warning {
							color: #FF9500;
							font-weight: 600;
							padding: 12px 16px;
							background: rgba(255, 149, 0, 0.15);
							border-radius: 10px;
							border-left: 4px solid #FF9500;
							margin-bottom: 16px;
							display: flex;
							align-items: center;
							gap: 10px;
						}
						
						.warning::before {
							content: '⚠️';
							font-size: 18px;
						}
						
						/* 响应式 */
						@media (max-width: 768px) {
							body {
								padding: 12px;
							}
							
							.glass-card {
								padding: 20px;
								border-radius: 20px;
							}
							
							.header h1 {
								font-size: 32px;
							}
							
							.sub-link {
								flex-direction: column;
								align-items: stretch;
							}
							
							.btn-copy {
								width: 100%;
							}
						}
						
						/* 加载动画 */
						@keyframes pulse {
							0%, 100% {
								opacity: 1;
							}
							50% {
								opacity: 0.5;
							}
						}
						
						.loading {
							animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
						}
					</style>
					<script src="https://cdn.jsdelivr.net/npm/@keeex/qrcodejs-kx@1.0.2/qrcode.min.js"></script>
				</head>
				<body>
					<div class="container">
						<div class="header">
							<h1>🚀 ${FileName}</h1>
							<p>现代化的订阅管理系统</p>
						</div>

						<div class="glass-card">
							<div class="section-title">📱 订阅地址</div>
							<p style="color: rgba(255,255,255,0.7); margin-bottom: 24px; font-size: 14px;">点击复制按钮即可复制订阅链接并生成二维码</p>
							
							<div class="sub-item" style="--index: 0;">
								<div class="sub-label">自适应订阅</div>
								<div class="sub-link">
									<a href="javascript:void(0)">https://${url.hostname}/${mytoken}</a>
									<button class="btn btn-copy" onclick="copyToClipboard('https://${url.hostname}/${mytoken}','qr0')">📋 复制</button>
								</div>
								<div id="qr0"></div>
							</div>

							<div class="sub-item" style="--index: 1;">
								<div class="sub-label">Base64 订阅</div>
								<div class="sub-link">
									<a href="javascript:void(0)">https://${url.hostname}/${mytoken}?b64</a>
									<button class="btn btn-copy" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?b64','qr1')">📋 复制</button>
								</div>
								<div id="qr1"></div>
							</div>

							<div class="sub-item" style="--index: 2;">
								<div class="sub-label">Clash 订阅</div>
								<div class="sub-link">
									<a href="javascript:void(0)">https://${url.hostname}/${mytoken}?clash</a>
									<button class="btn btn-copy" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?clash','qr2')">📋 复制</button>
								</div>
								<div id="qr2"></div>
							</div>

							<div class="sub-item" style="--index: 3;">
								<div class="sub-label">Sing-box 订阅</div>
								<div class="sub-link">
									<a href="javascript:void(0)">https://${url.hostname}/${mytoken}?sb</a>
									<button class="btn btn-copy" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?sb','qr3')">📋 复制</button>
								</div>
								<div id="qr3"></div>
							</div>

							<div class="sub-item" style="--index: 4;">
								<div class="sub-label">Surge 订阅</div>
								<div class="sub-link">
									<a href="javascript:void(0)">https://${url.hostname}/${mytoken}?surge</a>
									<button class="btn btn-copy" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?surge','qr4')">📋 复制</button>
								</div>
								<div id="qr4"></div>
							</div>

							<div class="sub-item" style="--index: 5;">
								<div class="sub-label">Loon 订阅</div>
								<div class="sub-link">
									<a href="javascript:void(0)">https://${url.hostname}/${mytoken}?loon</a>
									<button class="btn btn-copy" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?loon','qr5')">📋 复制</button>
								</div>
								<div id="qr5"></div>
							</div>

							<div class="collapsible">
								<div class="collapse-toggle" onclick="toggleGuest()">
									<span id="toggleIcon">▶</span>
									<span>查看访客订阅</span>
								</div>
								<div id="guestContent" style="display: none;">
									<div class="collapse-content">
										<div class="warning">访客订阅仅可使用订阅功能，无法查看配置页面</div>
										<div class="info-box">
											<p><strong>访客 TOKEN：</strong>${guest}</p>
										</div>

										<div class="sub-item" style="--index: 6;">
											<div class="sub-label">自适应订阅</div>
											<div class="sub-link">
												<a href="javascript:void(0)">https://${url.hostname}/sub?token=${guest}</a>
												<button class="btn btn-copy" onclick="copyToClipboard('https://${url.hostname}/sub?token=${guest}','gqr0')">📋 复制</button>
											</div>
											<div id="gqr0"></div>
										</div>

										<div class="sub-item" style="--index: 7;">
											<div class="sub-label">Base64 订阅</div>
											<div class="sub-link">
												<a href="javascript:void(0)">https://${url.hostname}/sub?token=${guest}&b64</a>
												<button class="btn btn-copy" onclick="copyToClipboard('https://${url.hostname}/sub?token=${guest}&b64','gqr1')">📋 复制</button>
											</div>
											<div id="gqr1"></div>
										</div>

										<div class="sub-item" style="--index: 8;">
											<div class="sub-label">Clash 订阅</div>
											<div class="sub-link">
												<a href="javascript:void(0)">https://${url.hostname}/sub?token=${guest}&clash</a>
												<button class="btn btn-copy" onclick="copyToClipboard('https://${url.hostname}/sub?token=${guest}&clash','gqr2')">📋 复制</button>
											</div>
											<div id="gqr2"></div>
										</div>

										<div class="sub-item" style="--index: 9;">
											<div class="sub-label">Sing-box 订阅</div>
											<div class="sub-link">
												<a href="javascript:void(0)">https://${url.hostname}/sub?token=${guest}&sb</a>
												<button class="btn btn-copy" onclick="copyToClipboard('https://${url.hostname}/sub?token=${guest}&sb','gqr3')">📋 复制</button>
											</div>
											<div id="gqr3"></div>
										</div>

										<div class="sub-item" style="--index: 10;">
											<div class="sub-label">Surge 订阅</div>
											<div class="sub-link">
												<a href="javascript:void(0)">https://${url.hostname}/sub?token=${guest}&surge</a>
												<button class="btn btn-copy" onclick="copyToClipboard('https://${url.hostname}/sub?token=${guest}&surge','gqr4')">📋 复制</button>
											</div>
											<div id="gqr4"></div>
										</div>

										<div class="sub-item" style="--index: 11;">
											<div class="sub-label">Loon 订阅</div>
											<div class="sub-link">
												<a href="javascript:void(0)">https://${url.hostname}/sub?token=${guest}&loon</a>
												<button class="btn btn-copy" onclick="copyToClipboard('https://${url.hostname}/sub?token=${guest}&loon','gqr5')">📋 复制</button>
											</div>
											<div id="gqr5"></div>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div class="glass-card">
							<div class="section-title">⚙️ 订阅转换配置</div>
							<div class="info-box">
								<p><strong>订阅转换后端：</strong>${subProtocol}://${subConverter}</p>
								<p><strong>配置文件：</strong>${subConfig}</p>
							</div>
						</div>

						<div class="glass-card">
							<div class="section-title">📝 订阅内容编辑</div>
							${hasKV ? `
								<textarea class="editor" id="content" placeholder="在此输入订阅链接或节点信息...

支持格式：
- 订阅链接（一行一条）
- 节点链接（vmess://、vless://、trojan:// 等）
- 留空则使用默认配置">${content}</textarea>
								<div class="save-container">
									<button class="btn btn-primary" onclick="saveContent(this)">💾 保存配置</button>
									<span class="save-status" id="saveStatus"></span>
								</div>
							` : `
								<div class="warning">
									请先绑定名为 <strong>KV</strong> 的 KV 命名空间才能使用编辑功能
								</div>
							`}
						</div>
					</div>

					<script>
					function copyToClipboard(text, qrId) {
						navigator.clipboard.writeText(text).then(() => {
							// 显示复制成功提示
							const btn = event.target;
							const originalText = btn.innerHTML;
							btn.innerHTML = '✓ 已复制';
							btn.classList.add('btn-success');
							
							setTimeout(() => {
								btn.innerHTML = originalText;
								btn.classList.remove('btn-success');
								btn.classList.add('btn-copy');
							}, 2000);
							
							// 生成二维码
							const qrDiv = document.getElementById(qrId);
							qrDiv.innerHTML = '';
							const wrapper = document.createElement('div');
							wrapper.className = 'qrcode-wrapper';
							qrDiv.appendChild(wrapper);
							
							new QRCode(wrapper, {
								text: text,
								width: 200,
								height: 200,
								colorDark: "#000000",
								colorLight: "#ffffff",
								correctLevel: QRCode.CorrectLevel.M
							});
						}).catch(err => {
							alert('复制失败，请手动复制');
							console.error('复制失败:', err);
						});
					}

					function toggleGuest() {
						const content = document.getElementById('guestContent');
						const icon = document.getElementById('toggleIcon');
						
						if (content.style.display === 'none') {
							content.style.display = 'block';
							icon.textContent = '▼';
						} else {
							content.style.display = 'none';
							icon.textContent = '▶';
						}
					}

					${hasKV ? `
					let saveTimer;
					const textarea = document.getElementById('content');
					
					function saveContent(button) {
						const updateButtonText = (text) => {
							button.innerHTML = text;
						};
						
						const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
						
						if (!isIOS) {
							textarea.value = textarea.value.replace(/：/g, ':');
						}
						
						updateButtonText('💾 保存中...');
						button.disabled = true;
						button.classList.add('loading');

						const newContent = textarea.value || '';
						const originalContent = textarea.defaultValue || '';

						const updateStatus = (message, isError = false) => {
							const statusElem = document.getElementById('saveStatus');
							if (statusElem) {
								statusElem.textContent = message;
								statusElem.style.color = isError ? '#FF3B30' : '#34C759';
							}
						};

						const resetButton = () => {
							button.innerHTML = '💾 保存配置';
							button.disabled = false;
							button.classList.remove('loading');
						};

						if (newContent !== originalContent) {
							fetch(window.location.href, {
								method: 'POST',
								body: newContent,
								headers: {
									'Content-Type': 'text/plain;charset=UTF-8'
								}
							})
							.then(response => {
								if (!response.ok) {
									throw new Error(\`HTTP error! status: \${response.status}\`);
								}
								const now = new Date().toLocaleString('zh-CN');
								document.title = \`✅ 已保存 - \${now}\`;
								updateStatus(\`✅ 保存成功 \${now}\`);
								textarea.defaultValue = newContent;
							})
							.catch(error => {
								console.error('Save error:', error);
								updateStatus(\`❌ 保存失败: \${error.message}\`, true);
							})
							.finally(() => {
								resetButton();
							});
						} else {
							updateStatus('ℹ️ 内容未更改');
							resetButton();
						}
					}

					textarea.addEventListener('input', () => {
						clearTimeout(saveTimer);
						saveTimer = setTimeout(() => {
							const btn = document.querySelector('.btn-primary');
							if (btn) saveContent(btn);
						}, 3000);
					});
					` : ''}
					</script>
				</body>
			</html>
		`;

		return new Response(html, {
			headers: { "Content-Type": "text/html;charset=utf-8" }
		});
	} catch (error) {
		console.error('处理请求时发生错误:', error);
		return new Response("服务器错误: " + error.message, {
			status: 500,
			headers: { "Content-Type": "text/plain;charset=utf-8" }
		});
	}
}
