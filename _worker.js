--- START OF FILE _worker.js ---

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
let PASSWORD = ''; // 访问管理页面的密码，为空则不验证

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
		PASSWORD = env.PASSWORD || PASSWORD;

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

		// 验证 Token 或 路径是否匹配
		if (!([mytoken, fakeToken, 访客订阅].includes(token) || url.pathname == ("/" + mytoken) || url.pathname.includes("/" + mytoken + "?"))) {
			// 异常访问或代理请求
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
			// Token 验证通过
			if (env.KV) {
				await 迁移地址列表(env, 'LINK.txt');
				// 如果是浏览器访问且不是纯订阅请求，进入管理页面（KV编辑）
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

			// 正常的订阅处理逻辑
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
						console.log('订阅转换请回base64失败');
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
		body { width: 35em; margin: 0 auto; font-family: Tahoma, Verdana, Arial, sans-serif; }
	</style>
	</head>
	<body>
	<h1>Welcome to nginx!</h1>
	<p>If you see this page, the nginx web server is successfully installed and working. Further configuration is required.</p>
	<p>For online documentation and support please refer to <a href="http://nginx.org/">nginx.org</a>.<br/>
	Commercial support is available at <a href="http://nginx.com/">nginx.com</a>.</p>
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
				return { status: '请求失败', value: null, apiUrl: api[index] };
			}
			return { status: response.status, value: response.value, apiUrl: api[index] };
		});

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

// 鉴权函数
function checkAuth(request) {
	if (!PASSWORD) return true;
	const cookie = request.headers.get('Cookie');
	if (cookie && cookie.includes(`auth=${PASSWORD}`)) return true;
	return false;
}

// 获取登录页面
function getLoginPage() {
	return `
	<!DOCTYPE html>
	<html lang="zh-CN">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Password Required</title>
		<style>
			:root {
				--bg: #f2f2f7;
				--card: #ffffff;
				--text: #000000;
				--blue: #007aff;
			}
			@media (prefers-color-scheme: dark) {
				:root {
					--bg: #000000;
					--card: #1c1c1e;
					--text: #ffffff;
				}
			}
			body {
				font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
				background-color: var(--bg);
				color: var(--text);
				display: flex;
				justify-content: center;
				align-items: center;
				height: 100vh;
				margin: 0;
			}
			.login-container {
				background: var(--card);
				padding: 2rem;
				border-radius: 20px;
				box-shadow: 0 4px 12px rgba(0,0,0,0.1);
				text-align: center;
				width: 300px;
			}
			h1 { font-size: 24px; margin-bottom: 20px; }
			input {
				width: 100%;
				padding: 12px;
				margin-bottom: 15px;
				border: 1px solid #ccc;
				border-radius: 12px;
				box-sizing: border-box;
				font-size: 16px;
				background: var(--bg);
				color: var(--text);
			}
			button {
				width: 100%;
				padding: 12px;
				background-color: var(--blue);
				color: white;
				border: none;
				border-radius: 12px;
				font-size: 16px;
				cursor: pointer;
				font-weight: 600;
			}
			button:hover { opacity: 0.9; }
		</style>
	</head>
	<body>
		<div class="login-container">
			<h1>请输入密码</h1>
			<form method="POST" action="/login">
				<input type="password" name="password" placeholder="Password" required autofocus>
				<button type="submit">登录</button>
			</form>
		</div>
	</body>
	</html>
	`;
}

async function KV(request, env, txt = 'ADD.txt', guest) {
	const url = new URL(request.url);

	// 处理登录请求
	if (url.pathname === '/login' && request.method === 'POST') {
		const formData = await request.formData();
		const password = formData.get('password');
		if (password === PASSWORD) {
			return new Response("Login Success", {
				status: 302,
				headers: {
					'Set-Cookie': `auth=${PASSWORD}; Path=/; Max-Age=3600; HttpOnly`,
					'Location': `/${mytoken}`
				}
			});
		} else {
			return new Response("Password Incorrect", { status: 403 });
		}
	}

	// 检查鉴权
	if (!checkAuth(request)) {
		return new Response(getLoginPage(), {
			headers: { "Content-Type": "text/html;charset=utf-8" }
		});
	}

	try {
		// POST请求处理（保存）
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

		// GET请求部分
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
					<title>${FileName} 管理面板</title>
					<meta charset="utf-8">
					<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
					<style>
						:root {
							--ios-bg: #f2f2f7;
							--ios-card: #ffffff;
							--ios-text: #000000;
							--ios-text-secondary: #8e8e93;
							--ios-separator: #c6c6c8;
							--ios-blue: #007aff;
							--ios-green: #34c759;
							--ios-red: #ff3b30;
							--ios-input-bg: #e5e5ea;
						}
						@media (prefers-color-scheme: dark) {
							:root {
								--ios-bg: #000000;
								--ios-card: #1c1c1e;
								--ios-text: #ffffff;
								--ios-text-secondary: #98989d;
								--ios-separator: #38383a;
								--ios-input-bg: #2c2c2e;
							}
						}
						body {
							margin: 0;
							padding: 0;
							background-color: var(--ios-bg);
							font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
							color: var(--ios-text);
							-webkit-font-smoothing: antialiased;
						}
						.container {
							max-width: 640px;
							margin: 0 auto;
							padding: 20px 16px 40px;
						}
						.header {
							margin-bottom: 20px;
							padding: 0 10px;
						}
						.header h1 {
							font-size: 34px;
							font-weight: 700;
							margin: 0;
						}
						.section-title {
							font-size: 13px;
							color: var(--ios-text-secondary);
							text-transform: uppercase;
							margin: 20px 0 8px 16px;
							letter-spacing: -0.2px;
						}
						.card {
							background-color: var(--ios-card);
							border-radius: 12px;
							overflow: hidden;
						}
						.list-item {
							padding: 12px 16px;
							border-bottom: 0.5px solid var(--ios-separator);
							display: flex;
							align-items: center;
							justify-content: space-between;
							cursor: pointer;
							transition: background-color 0.2s;
							font-size: 17px;
						}
						.list-item:last-child {
							border-bottom: none;
						}
						.list-item:active {
							background-color: rgba(128, 128, 128, 0.1);
						}
						.list-item-content {
							display: flex;
							flex-direction: column;
							flex: 1;
							padding-right: 10px;
						}
						.list-item-title {
							font-weight: 500;
							margin-bottom: 2px;
						}
						.list-item-desc {
							font-size: 13px;
							color: var(--ios-text-secondary);
						}
						.action-btn {
							color: var(--ios-blue);
							background: none;
							border: none;
							font-size: 15px;
							font-weight: 500;
							cursor: pointer;
							padding: 4px 8px;
							border-radius: 6px;
							background-color: rgba(0, 122, 255, 0.1);
						}
						.editor-wrapper {
							padding: 0;
						}
						.editor {
							width: 100%;
							min-height: 250px;
							border: none;
							background-color: var(--ios-card);
							color: var(--ios-text);
							font-size: 14px;
							line-height: 1.5;
							font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
							padding: 16px;
							box-sizing: border-box;
							resize: vertical;
							outline: none;
						}
						.status-bar {
							display: flex;
							justify-content: space-between;
							align-items: center;
							padding: 12px 16px;
							background-color: var(--ios-card);
							border-top: 0.5px solid var(--ios-separator);
						}
						.save-btn {
							background-color: var(--ios-green);
							color: white;
							border: none;
							padding: 8px 20px;
							border-radius: 18px;
							font-size: 15px;
							font-weight: 600;
							cursor: pointer;
						}
						.save-btn:disabled {
							opacity: 0.5;
							cursor: not-allowed;
						}
						.qrcode-container {
							display: none;
							padding: 16px;
							background: var(--ios-card);
							text-align: center;
							border-top: 0.5px solid var(--ios-separator);
						}
						.footer {
							text-align: center;
							margin-top: 30px;
							font-size: 13px;
							color: var(--ios-text-secondary);
						}
						.footer a {
							color: var(--ios-text-secondary);
							text-decoration: none;
						}
						.badge {
							font-size: 12px;
							background: rgba(142, 142, 147, 0.2);
							padding: 2px 6px;
							border-radius: 4px;
							margin-left: 6px;
							color: var(--ios-text-secondary);
						}
						.accordion {
							max-height: 0;
							overflow: hidden;
							transition: max-height 0.3s ease-out;
						}
						.accordion.open {
							max-height: 1000px;
						}
					</style>
					<script src="https://cdn.jsdelivr.net/npm/@keeex/qrcodejs-kx@1.0.2/qrcode.min.js"></script>
				</head>
				<body>
					<div class="container">
						<div class="header">
							<h1>${FileName}</h1>
							<div style="font-size: 15px; color: var(--ios-text-secondary); margin-top: 5px;">订阅管理面板</div>
						</div>

						<div class="section-title">配置编辑器 (KV)</div>
						<div class="card editor-wrapper">
							${hasKV ? `
							<textarea class="editor" id="content" placeholder="输入节点链接或订阅链接...">${content}</textarea>
							<div class="status-bar">
								<span id="saveStatus" style="font-size: 13px; color: var(--ios-text-secondary);">准备就绪</span>
								<button class="save-btn" onclick="saveContent(this)">保存</button>
							</div>
							` : '<div style="padding: 20px; text-align: center;">未绑定 KV 命名空间</div>'}
						</div>

						<div class="section-title">我的订阅</div>
						<div class="card">
							<div class="list-item" onclick="toggleQRCode('qrcode_0', 'https://${url.hostname}/${mytoken}')">
								<div class="list-item-content">
									<div class="list-item-title">自适应订阅 <span class="badge">推荐</span></div>
									<div class="list-item-desc">自动判断客户端类型</div>
								</div>
								<button class="action-btn" onclick="event.stopPropagation(); copyToClipboard('https://${url.hostname}/${mytoken}')">复制</button>
							</div>
							<div id="qrcode_0" class="qrcode-container"></div>

							<div class="list-item" onclick="toggleQRCode('qrcode_1', 'https://${url.hostname}/${mytoken}?base64')">
								<div class="list-item-content">
									<div class="list-item-title">Base64</div>
									<div class="list-item-desc">通用格式</div>
								</div>
								<button class="action-btn" onclick="event.stopPropagation(); copyToClipboard('https://${url.hostname}/${mytoken}?base64')">复制</button>
							</div>
							<div id="qrcode_1" class="qrcode-container"></div>
							
							<div class="list-item" onclick="toggleQRCode('qrcode_2', 'https://${url.hostname}/${mytoken}?clash')">
								<div class="list-item-content">
									<div class="list-item-title">Clash</div>
									<div class="list-item-desc">Meta / Mihomo</div>
								</div>
								<button class="action-btn" onclick="event.stopPropagation(); copyToClipboard('https://${url.hostname}/${mytoken}?clash')">复制</button>
							</div>
							<div id="qrcode_2" class="qrcode-container"></div>

							<div class="list-item" onclick="toggleQRCode('qrcode_3', 'https://${url.hostname}/${mytoken}?sb')">
								<div class="list-item-content">
									<div class="list-item-title">Sing-box</div>
									<div class="list-item-desc">JSON 配置</div>
								</div>
								<button class="action-btn" onclick="event.stopPropagation(); copyToClipboard('https://${url.hostname}/${mytoken}?sb')">复制</button>
							</div>
							<div id="qrcode_3" class="qrcode-container"></div>
						</div>

						<div class="section-title" onclick="toggleGuest()" style="cursor: pointer; display: flex; justify-content: space-between;">
							<span>访客订阅</span>
							<span id="guest-arrow">▼</span>
						</div>
						<div id="guest-content" class="accordion card">
							<div style="padding: 12px 16px; font-size: 13px; color: var(--ios-text-secondary); background: rgba(0,0,0,0.02);">
								Token: ${guest} (仅订阅权限)
							</div>
							<div class="list-item" onclick="copyToClipboard('https://${url.hostname}/sub?token=${guest}')">
								<div class="list-item-content">
									<div class="list-item-title">自适应链接</div>
								</div>
								<button class="action-btn">复制</button>
							</div>
							<div class="list-item" onclick="copyToClipboard('https://${url.hostname}/sub?token=${guest}&clash')">
								<div class="list-item-content">
									<div class="list-item-title">Clash 链接</div>
								</div>
								<button class="action-btn">复制</button>
							</div>
						</div>

						<div class="footer">
							<p>后端: ${subConverter}</p>
							<p><a href="https://github.com/cmliu/CF-Workers-SUB" target="_blank">CF-Workers-SUB Project</a></p>
						</div>
					</div>

					<script>
					function copyToClipboard(text) {
						navigator.clipboard.writeText(text).then(() => {
							const btn = event.target;
							const originalText = btn.textContent;
							btn.textContent = '已复制';
							btn.style.backgroundColor = 'rgba(52, 199, 89, 0.1)';
							btn.style.color = '#34c759';
							setTimeout(() => {
								btn.textContent = originalText;
								btn.style.backgroundColor = '';
								btn.style.color = '';
							}, 1500);
						}).catch(err => {
							alert('复制失败');
						});
					}

					function toggleQRCode(id, text) {
						const el = document.getElementById(id);
						if (el.style.display === 'block') {
							el.style.display = 'none';
							return;
						}
						
						// Close others
						document.querySelectorAll('.qrcode-container').forEach(d => d.style.display = 'none');
						
						el.innerHTML = '';
						el.style.display = 'block';
						
						const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
						
						new QRCode(el, {
							text: text,
							width: 200,
							height: 200,
							colorDark: "#000000",
							colorLight: "#ffffff",
							correctLevel: QRCode.CorrectLevel.Q
						});
					}

					function toggleGuest() {
						const content = document.getElementById('guest-content');
						const arrow = document.getElementById('guest-arrow');
						if (content.classList.contains('open')) {
							content.classList.remove('open');
							arrow.style.transform = 'rotate(0deg)';
						} else {
							content.classList.add('open');
							arrow.style.transform = 'rotate(180deg)';
						}
					}

					function saveContent(button) {
						const textarea = document.getElementById('content');
						const status = document.getElementById('saveStatus');
						const originalText = button.textContent;
						
						button.disabled = true;
						button.textContent = '保存中...';
						status.textContent = '正在同步 KV...';

						// 简单的全角转半角
						const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
						if (!isIOS) {
							textarea.value = textarea.value.replace(/：/g, ':');
						}

						fetch(window.location.href, {
							method: 'POST',
							body: textarea.value,
							headers: { 'Content-Type': 'text/plain;charset=UTF-8' }
						})
						.then(res => {
							if (res.ok) {
								status.textContent = '保存成功 ' + new Date().toLocaleTimeString();
								status.style.color = 'var(--ios-green)';
							} else {
								throw new Error(res.statusText);
							}
						})
						.catch(err => {
							status.textContent = '错误: ' + err.message;
							status.style.color = 'var(--ios-red)';
						})
						.finally(() => {
							button.disabled = false;
							button.textContent = originalText;
							setTimeout(() => {
								if(!status.textContent.includes('错误')) {
									status.style.color = 'var(--ios-text-secondary)';
								}
							}, 3000);
						});
					}
					
					// 自动保存逻辑
					let autoSaveTimer;
					const textarea = document.getElementById('content');
					if (textarea) {
						textarea.addEventListener('input', () => {
							document.getElementById('saveStatus').textContent = '输入中...';
							clearTimeout(autoSaveTimer);
							autoSaveTimer = setTimeout(() => saveContent(document.querySelector('.save-btn')), 5000);
						});
					}
					</script>
				</body>
			</html>
		`;

		return new Response(html, {
			headers: { "Content-Type": "text/html;charset=utf-8" }
		});
	} catch (error) {
		return new Response("服务器错误: " + error.message, { status: 500 });
	}
}
