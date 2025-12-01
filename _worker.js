// 部署完成后在网址后面加上这个,获取自建节点和机场聚合节点,/?token=auto或/auto或

let mytoken = 'auto';
let guestToken = ''; //可以随便取,或者uuid生成,https://1024tools.com/uuid
let BotToken = ''; //可以为空,或者@BotFather中输入/start,/newbot,并关注机器人
let ChatID = ''; //可以为空,或者@userinfobot中获取,/start
let TG = 0; //小白勿动, 开发者专用,1 为推送所有的访问信息,0 为不推送订阅转换后端的访问信息与异常访问
let FileName = 'CF-Workers-SUB';
let SUBUpdateTime = 6; //自定义订阅更新时间,单位小时
let total = 99;//TB
let timestamp = 4102329600000;//2099-12-31
let PASSWORD = ''; //访问密码,可选

//节点链接 + 订阅链接
let MainData = `
https://cfxr.eu.org/getSub
`;

let urls = [];
let subConverter = "SUBAPI.cmliussss.net"; //在线订阅转换后端,目前使用CM的订阅转换功能。支持自建psub 可自行搭建https://github.com/bulianglin/psub
let subConfig = "https://raw.githubusercontent.com/cmliu/ACL4SSR/main/Clash/config/ACL4SSR_Online_MultiCountry.ini"; //订阅配置文件
let subProtocol = 'https';

export default {
	async fetch(request, env) {
		const userAgentHeader = request.headers.get('User-Agent');
		const userAgent = userAgentHeader ? userAgentHeader.toLowerCase() : "null";
		const url = new URL(request.url);
		const token = url.searchParams.get('token');
		const password = url.searchParams.get('password');
		
		mytoken = env.TOKEN || mytoken;
		PASSWORD = env.PASSWORD || PASSWORD;
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

		// PASSWORD 验证
		if (PASSWORD && password !== PASSWORD && url.pathname === "/") {
			return new Response(await getIOSStyleUI(url.hostname, false), {
				status: 200,
				headers: {
					"Content-Type": "text/html;charset=utf-8",
				},
			});
		}

		if (!([mytoken, fakeToken, 访客订阅].includes(token) || url.pathname == ("/" + mytoken) || url.pathname.includes("/" + mytoken + "?"))) {
			if (TG == 1 && url.pathname !== "/" && url.pathname !== "/favicon.ico") await sendMessage(`#异常访问 ${FileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${userAgent}\n域名: ${url.hostname}\n路径: ${url.pathname}\n\n`);
			if (url.pathname == "/" || url.pathname == ("/" + fakeToken)) {
				return new Response(await getIOSStyleUI(url.hostname, true), {
					status: 200,
					headers: {
						"Content-Type": "text/html;charset=utf-8",
					},
				});
			} else {
				return new Response('Unauthorized', {
					status: 403
				});
			}
		}

		await sendMessage(`#获取订阅 ${FileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${userAgentHeader}\n域名: ${url.hostname}\n入口: ${url.pathname}\n\n`);
		let 订阅格式 = ['v2ray', 'clash', 'singbox', 'surge'];
		let 订阅转换URL = `${subProtocol}://${subConverter}/sub?target=`;
		let req_data = MainData;

		const 订阅转换器 = 订阅格式.includes((url.pathname.split("/")[1]).toLowerCase()) ? url.pathname.split("/")[1].toLowerCase() : 订阅格式[0];
		let 输出订阅 = ``;

		let subconverter = `${订阅转换URL}${订阅转换器}&url=${encodeURIComponent(req_data)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;

		try {
			const subconverterResponse = await fetch(subconverter);
			if (!subconverterResponse.ok) {
				throw new Error(`Error: ${subconverterResponse.status} ${subconverterResponse.statusText}`);
			}
			输出订阅 = await subconverterResponse.text();
		} catch (error) {
			return new Response(`订阅转换失败: ${error.message}`, {
				status: 500,
				headers: {
					"Content-Type": "text/plain;charset=utf-8",
				},
			});
		}

		return new Response(输出订阅, {
			status: 200,
			headers: {
				"Content-Type": "text/plain;charset=utf-8",
				"Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(FileName)}; filename=${FileName}`,
				"profile-update-interval": `${SUBUpdateTime}`,
				"subscription-userinfo": `upload=${UD}; download=${UD}; total=${total}; expire=${expire}`,
			},
		});
	},
};

async function MD5MD5(text) {
	const encoder = new TextEncoder();
	const firstPass = await crypto.subtle.digest('MD5', encoder.encode(text));
	const firstPassArray = Array.from(new Uint8Array(firstPass));
	const firstHex = firstPassArray.map(b => b.toString(16).padStart(2, '0')).join('');
	const secondPass = await crypto.subtle.digest('MD5', encoder.encode(firstHex));
	const secondPassArray = Array.from(new Uint8Array(secondPass));
	const secondHex = secondPassArray.map(b => b.toString(16).padStart(2, '0')).join('');
	return secondHex;
}

async function sendMessage(type, ip, add_data = "") {
	if (BotToken !== '' && ChatID !== '') {
		let msg = "";
		const response = await fetch(`http://ip-api.com/json/${ip}?lang=zh-CN`);
		if (response.status == 200) {
			const ipInfo = await response.json();
			msg = `${type}\nIP: ${ip}\n国家: ${ipInfo.country}\n<tg-spoiler>城市: ${ipInfo.city}\n组织: ${ipInfo.org}\nASN: ${ipInfo.as}\n${add_data}</tg-spoiler>`;
		} else {
			msg = `${type}\nIP: ${ip}\n<tg-spoiler>${add_data}</tg-spoiler>`;
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

async function getIOSStyleUI(hostname, isAuthorized) {
	const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>${FileName}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-tap-highlight-color: transparent;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            color: #1d1d1f;
        }
        
        .container {
            width: 100%;
            max-width: 420px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-radius: 28px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            overflow: hidden;
            animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(40px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 24px 32px;
            text-align: center;
            color: white;
        }
        
        .logo {
            width: 72px;
            height: 72px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 16px;
            font-size: 36px;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        }
        
        .title {
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.5px;
            margin-bottom: 8px;
        }
        
        .subtitle {
            font-size: 15px;
            opacity: 0.9;
            font-weight: 400;
        }
        
        .content {
            padding: 28px 24px;
        }
        
        .info-card {
            background: #f5f5f7;
            border-radius: 16px;
            padding: 20px;
            margin-bottom: 16px;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 0.5px solid rgba(0, 0, 0, 0.08);
        }
        
        .info-row:last-child {
            border-bottom: none;
            padding-bottom: 0;
        }
        
        .info-row:first-child {
            padding-top: 0;
        }
        
        .info-label {
            font-size: 15px;
            color: #6e6e73;
            font-weight: 500;
        }
        
        .info-value {
            font-size: 15px;
            font-weight: 600;
            color: #1d1d1f;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        
        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #34c759;
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
            0%, 100% {
                opacity: 1;
            }
            50% {
                opacity: 0.5;
            }
        }
        
        .password-section {
            margin-bottom: 20px;
        }
        
        .input-group {
            position: relative;
        }
        
        .input-field {
            width: 100%;
            padding: 16px;
            border: none;
            background: #f5f5f7;
            border-radius: 12px;
            font-size: 16px;
            font-family: inherit;
            transition: all 0.2s;
            outline: none;
        }
        
        .input-field:focus {
            background: #e8e8ed;
            box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        }
        
        .button {
            width: 100%;
            padding: 16px;
            border: none;
            border-radius: 12px;
            font-size: 17px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            font-family: inherit;
            margin-top: 12px;
        }
        
        .button-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
        }
        
        .button-primary:active {
            transform: scale(0.98);
            box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
        }
        
        .button-secondary {
            background: #f5f5f7;
            color: #667eea;
        }
        
        .button-secondary:active {
            background: #e8e8ed;
            transform: scale(0.98);
        }
        
        .link-list {
            list-style: none;
        }
        
        .link-item {
            background: #f5f5f7;
            border-radius: 12px;
            margin-bottom: 12px;
            overflow: hidden;
        }
        
        .link-button {
            width: 100%;
            padding: 16px 20px;
            border: none;
            background: transparent;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 16px;
            font-weight: 500;
            color: #1d1d1f;
            cursor: pointer;
            font-family: inherit;
            transition: background 0.2s;
        }
        
        .link-button:active {
            background: rgba(0, 0, 0, 0.05);
        }
        
        .link-icon {
            font-size: 20px;
            margin-right: 12px;
        }
        
        .link-text {
            flex: 1;
            text-align: left;
        }
        
        .chevron {
            color: #c7c7cc;
            font-size: 18px;
        }
        
        .footer {
            text-align: center;
            padding: 20px 24px 28px;
            font-size: 13px;
            color: #86868b;
        }
        
        @media (prefers-color-scheme: dark) {
            body {
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            }
            
            .container {
                background: rgba(30, 30, 30, 0.95);
            }
            
            .info-card,
            .input-field,
            .button-secondary,
            .link-item {
                background: #1c1c1e;
            }
            
            .info-row {
                border-bottom-color: rgba(255, 255, 255, 0.1);
            }
            
            .info-label {
                color: #98989d;
            }
            
            .info-value,
            .link-button {
                color: #f5f5f7;
            }
            
            .input-field:focus {
                background: #2c2c2e;
            }
            
            .link-button:active {
                background: rgba(255, 255, 255, 0.05);
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🚀</div>
            <div class="title">${FileName}</div>
            <div class="subtitle">订阅服务管理</div>
        </div>
        
        <div class="content">
            ${isAuthorized ? `
            <div class="info-card">
                <div class="info-row">
                    <span class="info-label">服务状态</span>
                    <span class="info-value">
                        <span class="status-dot"></span>
                        运行中
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">节点域名</span>
                    <span class="info-value">${hostname}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">更新周期</span>
                    <span class="info-value">${SUBUpdateTime} 小时</span>
                </div>
            </div>
            
            <ul class="link-list">
                <li class="link-item">
                    <button class="link-button" onclick="copyLink('v2ray')">
                        <span class="link-icon">📱</span>
                        <span class="link-text">通用订阅链接</span>
                        <span class="chevron">›</span>
                    </button>
                </li>
                <li class="link-item">
                    <button class="link-button" onclick="copyLink('clash')">
                        <span class="link-icon">⚡</span>
                        <span class="link-text">Clash 订阅链接</span>
                        <span class="chevron">›</span>
                    </button>
                </li>
                <li class="link-item">
                    <button class="link-button" onclick="copyLink('singbox')">
                        <span class="link-icon">📦</span>
                        <span class="link-text">SingBox 订阅链接</span>
                        <span class="chevron">›</span>
                    </button>
                </li>
                <li class="link-item">
                    <button class="link-button" onclick="copyLink('surge')">
                        <span class="link-icon">🌊</span>
                        <span class="link-text">Surge 订阅链接</span>
                        <span class="chevron">›</span>
                    </button>
                </li>
            </ul>
            ` : `
            <div class="password-section">
                <div class="input-group">
                    <input type="password" id="passwordInput" class="input-field" placeholder="请输入访问密码" />
                </div>
                <button class="button button-primary" onclick="submitPassword()">验证并访问</button>
            </div>
            <div class="info-card">
                <div class="info-row">
                    <span class="info-label">提示</span>
                    <span class="info-value">需要密码才能访问</span>
                </div>
            </div>
            `}
        </div>
        
        <div class="footer">
            © 2024 ${FileName} · Powered by Cloudflare Workers
        </div>
    </div>
    
    <script>
        function copyLink(type) {
            const link = window.location.origin + '/' + type + '?token=${mytoken}';
            navigator.clipboard.writeText(link).then(() => {
                alert('✓ 订阅链接已复制到剪贴板');
            }).catch(() => {
                const textarea = document.createElement('textarea');
                textarea.value = link;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                alert('✓ 订阅链接已复制到剪贴板');
            });
        }
        
        function submitPassword() {
            const password = document.getElementById('passwordInput').value;
            if (password) {
                window.location.href = window.location.origin + '/?password=' + encodeURIComponent(password);
            } else {
                alert('⚠️ 请输入密码');
            }
        }
        
        document.getElementById('passwordInput')?.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                submitPassword();
            }
        });
    </script>
</body>
</html>
	`;
	return html;
}
