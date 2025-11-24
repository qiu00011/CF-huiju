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
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${FileName} 管理面板</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/@keeex/qrcodejs-kx@1.0.2/qrcode.min.js"></script>
  <style>
    :root {
      --primary: #007AFF;
      --primary-hover: #0056b3;
      --bg-color: #f5f5f7;
      --card-bg: rgba(255, 255, 255, 0.65);
      --card-border: rgba(255, 255, 255, 0.4);
      --text-main: #1d1d1f;
      --text-sub: #86868b;
      --shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
      --radius: 20px;
      --transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --bg-color: #000000;
        --card-bg: rgba(28, 28, 30, 0.65);
        --card-border: rgba(255, 255, 255, 0.1);
        --text-main: #f5f5f7;
        --text-sub: #86868b;
        --shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
      }
    }

    * { margin: 0; padding: 0; box-sizing: border-box; outline: none; -webkit-tap-highlight-color: transparent; }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: var(--bg-color);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 20px;
      transition: var(--transition);
      position: relative;
      overflow-x: hidden;
    }

    /* 动态背景层 */
    #bg-container {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      z-index: -2;
      transition: opacity 0.5s ease;
      background-size: cover;
      background-position: center;
    }
    #bg-container video {
      width: 100%; height: 100%; object-fit: cover;
    }
    
    /* 背景遮罩，保证文字可读性 */
    .overlay {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      z-index: -1;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      background: rgba(var(--bg-color), 0.3);
      transition: var(--transition);
    }

    .main-container {
      width: 100%;
      max-width: 800px;
      z-index: 1;
    }

    /* 标题区域 */
    .header {
      text-align: center;
      margin-bottom: 40px;
      animation: fadeInDown 0.8s ease;
    }
    .header h1 {
      font-size: 40px;
      font-weight: 700;
      letter-spacing: -0.5px;
      margin-bottom: 10px;
      background: linear-gradient(135deg, var(--text-main) 0%, var(--text-sub) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .header p {
      font-size: 16px;
      color: var(--text-sub);
    }

    /* 卡片通用样式 */
    .card {
      background: var(--card-bg);
      backdrop-filter: blur(50px);
      -webkit-backdrop-filter: blur(50px);
      border: 1px solid var(--card-border);
      border-radius: var(--radius);
      padding: 30px;
      margin-bottom: 24px;
      box-shadow: var(--shadow);
      animation: fadeInUp 0.8s ease backwards;
      transition: var(--transition);
    }
    .card:hover { transform: translateY(-2px); box-shadow: 0 15px 40px rgba(0,0,0,0.1); }

    .card-title {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .card-title::before {
      content: ''; display: block; width: 4px; height: 18px;
      background: var(--primary); border-radius: 2px;
    }

    /* 输入框组 */
    .input-group {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
    }
    .input-field {
      flex: 1;
      background: rgba(128,128,128, 0.1);
      border: none;
      padding: 12px 16px;
      border-radius: 12px;
      color: var(--text-main);
      font-size: 14px;
      transition: var(--transition);
    }
    .input-field:focus {
      background: rgba(128,128,128, 0.15);
      box-shadow: 0 0 0 2px var(--primary);
    }

    /* 按钮样式 */
    .btn {
      padding: 12px 20px;
      border-radius: 12px;
      border: none;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: var(--transition);
      display: flex;
      align-items: center;
      gap: 6px;
      justify-content: center;
    }
    .btn:active { transform: scale(0.96); }
    
    .btn-primary {
      background: var(--primary);
      color: white;
      box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
    }
    .btn-primary:hover { background: var(--primary-hover); }
    
    .btn-secondary {
      background: rgba(128,128,128, 0.1);
      color: var(--text-main);
    }
    .btn-secondary:hover { background: rgba(128,128,128, 0.2); }

    /* 链接列表 */
    .link-item {
      background: rgba(255,255,255,0.05);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      border: 1px solid rgba(128,128,128, 0.1);
    }
    .link-label { font-size: 13px; font-weight: 600; color: var(--text-sub); }
    .link-url {
      font-family: 'SF Mono', monospace;
      font-size: 13px;
      color: var(--text-main);
      word-break: break-all;
      background: rgba(0,0,0,0.05);
      padding: 8px;
      border-radius: 8px;
    }
    .link-actions { display: flex; justify-content: flex-end; }

    /* 二维码容器 */
    .qr-container {
      margin-top: 10px;
      display: flex;
      justify-content: center;
      background: white;
      padding: 10px;
      border-radius: 12px;
      width: fit-content;
      margin-left: auto;
    }

    /* 编辑器 */
    .editor {
      width: 100%;
      min-height: 400px;
      background: rgba(20, 20, 25, 0.8);
      color: #e0e0e0;
      border-radius: 16px;
      padding: 20px;
      font-family: 'SF Mono', monospace;
      font-size: 14px;
      line-height: 1.6;
      border: 1px solid rgba(255,255,255,0.1);
      resize: vertical;
    }
    .editor:focus { border-color: var(--primary); }

    /* Toast 通知 */
    .toast {
      position: fixed;
      top: 30px;
      left: 50%;
      transform: translateX(-50%) translateY(-100px);
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(10px);
      color: white;
      padding: 12px 24px;
      border-radius: 50px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      z-index: 100;
      transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      display: flex;
      align-items: center;
      gap: 8px;
      opacity: 0;
    }
    .toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }

    /* 访客订阅折叠 */
    .guest-toggle {
      width: 100%;
      text-align: left;
      padding: 15px;
      background: rgba(128,128,128,0.05);
      border-radius: 12px;
      margin-top: 10px;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    /* 动画 */
    @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

  </style>
</head>
<body>

  <!-- 背景容器 -->
  <div id="bg-container"></div>
  <div class="overlay"></div>

  <!-- Toast -->
  <div id="toast" class="toast"><span>✅</span> <span id="toast-msg">操作成功</span></div>

  <div class="main-container">
    <div class="header">
      <h1>${FileName}</h1>
      <p>Cloudflare Workers 订阅管理中心</p>
    </div>

    <!-- 个性化设置卡片 -->
    <div class="card" style="animation-delay: 0.1s;">
      <div class="card-title">🎨 个性化设置</div>
      <div class="input-group">
        <input type="text" id="bg-input" class="input-field" placeholder="输入图片或视频直链 (mp4/mov/webm)...">
        <button class="btn btn-primary" onclick="saveBackground()">保存背景</button>
      </div>
      <p style="font-size: 12px; color: var(--text-sub);">支持 .mp4/.mov 视频自动静音循环播放，配置保存在本地浏览器。</p>
    </div>

    <!-- 订阅管理卡片 -->
    <div class="card" style="animation-delay: 0.2s;">
      <div class="card-title">📡 订阅链接</div>
      
      ${generateLinkItem('自适应订阅', `https://${url.hostname}/${mytoken}`, 'sub1')}
      ${generateLinkItem('Base64 订阅', `https://${url.hostname}/${mytoken}?b64`, 'sub2')}
      ${generateLinkItem('Clash 订阅', `https://${url.hostname}/${mytoken}?clash`, 'sub3')}
      ${generateLinkItem('Sing-box 订阅', `https://${url.hostname}/${mytoken}?sb`, 'sub4')}
      
      <div class="guest-section">
        <div class="guest-toggle" onclick="toggleGuest()">
          <span>👤 访客订阅 (Token: ${guest})</span>
          <span id="guest-arrow">▼</span>
        </div>
        <div id="guest-links" style="display: none; margin-top: 15px; padding-left: 10px; border-left: 2px solid var(--primary);">
           ${generateLinkItem('访客自适应', `https://${url.hostname}/sub?token=${guest}`, 'gsub1')}
           ${generateLinkItem('访客 Clash', `https://${url.hostname}/sub?token=${guest}&clash`, 'gsub2')}
        </div>
      </div>
    </div>

    <!-- 编辑器卡片 -->
    <div class="card" style="animation-delay: 0.3s;">
      <div class="card-title">📝 节点编辑</div>
      ${hasKV ? `
        <textarea id="editor" class="editor" placeholder="在此粘贴节点链接或订阅链接，一行一个...">${content}</textarea>
        <div style="margin-top: 20px; display: flex; justify-content: flex-end;">
          <button class="btn btn-primary" onclick="saveContent()" id="save-btn">
            <span>💾</span> 保存配置
          </button>
        </div>
      ` : `
        <div style="text-align: center; padding: 20px; color: var(--text-sub);">
          ⚠️ 未绑定 KV 命名空间，无法使用在线编辑功能。<br>请在 CF 后台绑定名为 <b>KV</b> 的空间。
        </div>
      `}
    </div>

  </div>

  <script>
    // 初始化
    window.onload = function() {
      loadBackground();
    }

    // --- 背景功能逻辑 ---
    function loadBackground() {
      const bgUrl = localStorage.getItem('cf_worker_bg');
      if (bgUrl) {
        document.getElementById('bg-input').value = bgUrl;
        applyBackground(bgUrl);
      }
    }

    function saveBackground() {
      const url = document.getElementById('bg-input').value.trim();
      if (!url) {
        localStorage.removeItem('cf_worker_bg');
        applyBackground('');
        showToast('背景已重置');
        return;
      }
      localStorage.setItem('cf_worker_bg', url);
      applyBackground(url);
      showToast('背景已保存');
    }

    function applyBackground(url) {
      const container = document.getElementById('bg-container');
      container.innerHTML = ''; // 清空
      
      if (!url) return;

      const ext = url.split('.').pop().toLowerCase().split('?')[0];
      const videoExts = ['mp4', 'mov', 'webm'];

      if (videoExts.includes(ext)) {
        const video = document.createElement('video');
        video.src = url;
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        // 确保视频加载
        video.onloadeddata = () => video.play();
        container.appendChild(video);
      } else {
        container.style.backgroundImage = \`url('\${url}')\`;
      }
    }

    // --- 工具函数 ---
    function showToast(message, type = 'success') {
      const toast = document.getElementById('toast');
      const msg = document.getElementById('toast-msg');
      msg.innerText = message;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2500);
    }

    function copyText(text, id) {
      navigator.clipboard.writeText(text).then(() => {
        showToast('复制成功');
        const container = document.getElementById('qr-' + id);
        container.innerHTML = '';
        new QRCode(container, {
          text: text,
          width: 120,
          height: 120
        });
      }).catch(() => showToast('复制失败', 'error'));
    }

    function toggleGuest() {
      const el = document.getElementById('guest-links');
      const arrow = document.getElementById('guest-arrow');
      if (el.style.display === 'none') {
        el.style.display = 'block';
        arrow.innerText = '▲';
      } else {
        el.style.display = 'none';
        arrow.innerText = '▼';
      }
    }

    // --- KV 保存逻辑 ---
    ${hasKV ? `
    function saveContent() {
      const btn = document.getElementById('save-btn');
      const text = document.getElementById('editor').value;
      
      btn.innerHTML = '⏳ 保存中...';
      btn.disabled = true;

      fetch(window.location.href, {
        method: 'POST',
        headers: {'Content-Type': 'text/plain'},
        body: text
      }).then(res => {
        if (res.ok) {
          showToast('✅ 配置保存成功');
        } else {
          showToast('❌ 保存失败', 'error');
        }
      }).catch(err => {
        showToast('❌ 网络错误', 'error');
      }).finally(() => {
        btn.innerHTML = '<span>💾</span> 保存配置';
        btn.disabled = false;
      });
    }
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

// 辅助函数：生成 HTML 列表项
function generateLinkItem(label, url, id) {
    return `
    <div class="link-item">
        <div class="link-label">${label}</div>
        <div class="link-url">${url}</div>
        <div class="link-actions">
            <button class="btn btn-secondary" onclick="copyText('${url}', '${id}')">📋 复制链接 & 二维码</button>
        </div>
        <div id="qr-${id}" class="qr-container"></div>
    </div>
    `;
}
