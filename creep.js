(function() {
    const timer = (logStart) => {
        console.log(logStart)
        const start = Date.now()
        return (logEnd) => {
            const end = Date.now() - start
            console.log(`${logEnd}: ${end/1000} seconds`)
        }
    }
    const attempt = fn => {
        try {
            return fn()
        } catch (err) {
            return undefined
        }
    }
    const hashify = async (x) => {
        const json = `${JSON.stringify(x)}`
        const jsonBuffer = new TextEncoder('utf-8').encode(json)
        const hashBuffer = await crypto.subtle.digest('SHA-256', jsonBuffer)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('')
        return hashHex
    }
    // ie11 fix for template.content
    function templateContent(template) {
        // template {display: none !important} /* add css if template is in dom */
        if ('content' in document.createElement('template')) {
            return document.importNode(template.content, true)
        } else {
            const frag = document.createDocumentFragment()
            const children = template.childNodes
            for (let i = 0, len = children.length; i < len; i++) {
                frag.appendChild(children[i].cloneNode(true))
            }
            return frag
        }
    }
    // tagged template literal (JSX alternative)
    const patch = async (oldEl, newEl, fn = null) => {
        oldEl.parentNode.replaceChild(newEl, oldEl);
        return typeof fn === 'function' ? await fn() : true
    }
    const html = (stringSet, ...expressionSet) => {
        const template = document.createElement('template')
        template.innerHTML = stringSet.map((str, i) => `${str}${expressionSet[i]||''}`).join('')
        return templateContent(template) // ie11 fix for template.content
    }
    // change varies
    const nav = () => {
        const n = navigator
        let {
            userAgent,
            appVersion,
            platform
        } = n
        const trust = (
            userAgent.includes(appVersion)
        ) ? true : false
        if (!trust) {
            userAgent = appVersion = platform = undefined
        }
        return {
            appVersion: appVersion,
            deviceMemory: n.deviceMemory, // device
            doNotTrack: n.doNotTrack,
            hardwareConcurrency: n.hardwareConcurrency, // device
            language: `${n.languages.join(', ')} (${n.language})`,
            maxTouchPoints: n.maxTouchPoints, // device
            platform: platform, // device
            userAgent: userAgent,
            vendor: n.vendor,
            mimeTypes: attempt(() => [...navigator.mimeTypes].map(m => m.type)),
            plugins: attempt(() => {
                return [...navigator.plugins]
                    .map(p => ({
                        name: p.name,
                        description: p.description,
                        filename: p.filename,
                        version: p.version
                    }))
            })
        }
    }
    // device + browser
    const screenFp = () => {
        let {
            width,
            height,
            availWidth,
            availHeight,
            availTop,
            availLeft,
            colorDepth, // device
            pixelDepth // device
        } = screen
        if (availWidth > width || availHeight > height) {
            width = height = availWidth = availHeight = availTop = availLeft = undefined // distrust
        }
        return {
            width,
            height,
            availWidth,
            availHeight,
            availTop,
            availLeft,
            colorDepth,
            pixelDepth
        }
    }
    // browser
    const getVoices = () => {
        return new Promise(resolve => {
            if (typeof speechSynthesis === 'undefined') {
                return resolve(undefined)
            } else if (speechSynthesis.getVoices().length) {
                return resolve(voices)
            } else {
                speechSynthesis.onvoiceschanged = () => resolve(speechSynthesis.getVoices())
            }
        })
    }
    // device
    const getmediaDevices = () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            new Promise(resolve => resolve(undefined))
        }
        return navigator.mediaDevices.enumerateDevices()
    }
    // browser
    const canvas = () => {
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        const str = '%$%^LGFWE($HIF)'
        context.font = '20px Arial'
        context.fillText(str, 100, 100)
        context.fillStyle = 'red'
        context.fillRect(100, 30, 80, 50)
        context.font = '32px Times New Roman'
        context.fillStyle = 'blue'
        context.fillText(str, 20, 70)
        context.font = '20px Arial'
        context.fillStyle = 'green'
        context.fillText(str, 10, 50)
        return canvas.toDataURL()
    }
    // device + browser
    const webgl = () => {
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('webgl')
        return {
            unmasked: () => {
                const extension = context.getExtension('WEBGL_debug_renderer_info')
                const vendor = context.getParameter(extension.UNMASKED_VENDOR_WEBGL)
                const renderer = context.getParameter(extension.UNMASKED_RENDERER_WEBGL)
                return {
                    vendor,
                    renderer
                }
            },
            dataURL: () => {
                context.clearColor(0.2, 0.4, 0.6, 0.8)
                context.clear(context.COLOR_BUFFER_BIT)
                return canvas.toDataURL()
            }
        }
    }
    // device + browser
    const maths = () => {
        const n = 0.123124234234234242
        const fns = [
            ['acos', [n]],
            ['acosh', [1e308]],
            ['acoshPf', [1e154]],
            ['asin', [n]],
            ['asinh', [1e300]],
            ['asinh', [1]],
            ['asinhPf', [1]],
            ['atan', [2]],
            ['atanh', [0.5]],
            ['atanhPf', [0.5]],
            ['atan2', [90, 15]],
            ['atan2', [1e-310, 2]],
            ['cbrt', [100]],
            ['cbrtPf', [100]],
            ['cosh', [100]],
            ['coshPf', [100]],
            ['expm1', [1]],
            ['expm1Pf', [1]],
            ['sin', [1]],
            ['sinh', [1]],
            ['sinhPf', [1]],
            ['tan', [-1e308]],
            ['tanh', [1e300]],
            ['tanhPf', [1e300]],
            ['cosh', [1]],
            ['coshPf', [1]],
            ['sin', [Math.PI]],
            ['pow', [Math.PI, -100]]
        ]
        return fns.map(fn => ({
            [fn[0]]: attempt(() => Math[fn[0]](...fn[1]))
        }))
    }
    // browser
    const consoleErrs = () => {
        const getErrors = (errs, errFns) => {
            let i, len = errFns.length
            for (i = 0; i < len; i++) {
                try {
                    errFns[i]()
                } catch (err) {
                    errs.push(err.message)
                }
            }
            return errs
        }
        const errFns = [
            () => eval('alert(")'),
            () => eval('const foo;foo.bar'),
            () => eval('null.bar'),
            () => eval('abc.xyz = 123'),
            () => eval('const foo;foo.bar'),
            () => eval('(1).toString(1000)'),
            () => eval('[...undefined].length'),
            () => eval('var x = new Array(-1)'),
            () => eval('const a=1; const a=2;')
        ]
        return getErrors([], errFns)
    }
    // device
    const timezone = () => {
        const time = /(\d{1,2}:\d{1,2}:\d{1,2}\s)/ig
        return [
            (new Date()).getTimezoneOffset(),
            Intl.DateTimeFormat().resolvedOptions().timeZone,
            (new Date('1/1/2001').toTimeString()).replace(time, '')
        ].join(', ')
    }
    // device + browser
    const cRects = () => {
        const cRectProps = ['x', 'y', 'width', 'height', 'top', 'right', 'bottom', 'left']
        const rectElems = document.getElementsByClassName('rects')
        const rectFp = [...rectElems].map(el => el.getClientRects()[0].toJSON())
        return rectFp
    }
    // scene
    const scene = html `
	<fingerprint>
		<div id="fingerpring"></div>
		<style>
		#rect-container{opacity:0;position:relative;border:1px solid #F72585}.rects{width:10px;height:10px;max-width:100%}.absolute{position:absolute}#cRect1{border:solid 2.715px;border-color:#F72585;padding:3.98px;margin-left:12.12px}#cRect2{border:solid 2px;border-color:#7209B7;font-size:30px;margin-top:20px;transform:skewY(23.1753218deg)}#cRect3{border:solid 2.89px;border-color:#3A0CA3;font-size:45px;transform:scale(100000000000000000000009999999999999.99, 1.89);margin-top:50px}#cRect4{border:solid 2px;border-color:#4361EE;transform:matrix(1.11, 2.0001, -1.0001, 1.009, 150, 94.4);margin-top:11.1331px;margin-left:12.1212px;padding:4.4545px;left:239.4141px;top:8.5050px}#cRect5{border:solid 2px;border-color:#4CC9F0;margin-left:42.395pt}#cRect6{border:solid 2px;border-color:#F72585;transform:perspective(12890px) translateZ(101.5px);padding:12px}#cRect7{margin-top:-350.552px;margin-left:0.9099rem;border:solid 2px;border-color:#4361EE}#cRect8{margin-top:-150.552px;margin-left:15.9099rem;border:solid 2px;border-color:#3A0CA3}#cRect9{margin-top:-110.552px;margin-left:15.9099rem;border:solid 2px;border-color:#7209B7}#cRect10{margin-top:-315.552px;margin-left:15.9099rem;border:solid 2px;border-color:#F72585}
		</style>
		<div id="rect-container">
			<div id="cRect1" class="rects"></div>
			<div id="cRect2" class="rects"></div>
			<div id="cRect3" class="rects"></div>
			<div id="cRect4" class="rects absolute"></div>
			<div id="cRect5" class="rects"></div>
			<div id="cRect6" class="rects"></div>
			<div id="cRect7" class="rects absolute"></div>
			<div id="cRect8" class="rects absolute"></div>
			<div id="cRect9" class="rects absolute"></div>
			<div id="cRect10" class="rects absolute"></div>
		</div>
	</fingerprint>
	`
    // fingerprint
    const fingerprint = async () => {
        // attempt to compute values
        const navComputed = attempt(() => nav())
        const {
            mimeTypes,
            plugins
        } = navComputed
        const screenComputed = attempt(() => screenFp())
        const canvasComputed = attempt(() => canvas())
        const gl = attempt(() => webgl())
        const webglComputed = {
            vendor: attempt(() => gl.unmasked().vendor),
            renderer: attempt(() => gl.unmasked().renderer)
        }
        const webglDataURLComputed = attempt(() => gl.dataURL())
        const consoleErrorsComputed = attempt(() => consoleErrs())
        const timezoneComputed = attempt(() => timezone())
        const cRectsComputed = attempt(() => cRects())
        const mathsComputed = attempt(() => maths())
        // await voices and media, then compute
        const [
            voices,
            mediaDevices
        ] = await Promise.all([
            getVoices(),
            getmediaDevices()
        ])
        const voicesComputed = voices.map(({
            name,
            lang
        }) => ({
            name,
            lang
        }))
        const mediaDevicesComputed = mediaDevices
            .map(({
                kind
            }) => ({
                kind
            })) // chrome randomizes groupId
        // await hash values
        const [
            mimeTypesHash, // order must match
            pluginsHash,
            voicesHash,
            mediaDeviceHash,
            screenHash,
            weglDataURLHash,
            consoleErrorsHash,
            cRectsHash,
            mathsHash,
            canvasHash
        ] = await Promise.all([
            hashify(mimeTypes),
            hashify(plugins),
            hashify(voicesComputed),
            hashify(mediaDevicesComputed),
            hashify(screenComputed),
            hashify(webglDataURLComputed),
            hashify(consoleErrorsComputed),
            hashify(cRectsComputed),
            hashify(mathsComputed),
            hashify(canvasComputed)
        ])
        const fingerprint = {
            nav: navComputed,
            timezone: timezoneComputed,
            webgl: webglComputed,
            mimeTypes: [mimeTypes, mimeTypesHash],
            plugins: [plugins, pluginsHash],
            voices: [voicesComputed, voicesHash],
            mediaDevices: [mediaDevicesComputed, mediaDeviceHash],
            screen: [screenComputed, screenHash],
            webglDataURL: [webglDataURLComputed, weglDataURLHash],
            consoleErrors: [consoleErrorsComputed, consoleErrorsHash],
            cRects: [cRectsComputed, cRectsHash],
            maths: [mathsComputed, mathsHash],
            canvas: [canvasComputed, canvasHash]
        }
        return fingerprint
    }
    // patch
    const app = document.getElementById('fp-app')
    patch(app, scene, async () => {
        // fingerprint and and render
        const fpElem = document.getElementById('fingerpring')
        const fp = await fingerprint().catch((e) => console.log(e))
        const {
            nav,
            webgl,
            mediaDevices
        } = fp
        const device = {
            renderer: webgl.renderer,
            timezone: fp.timezone,
            deviceMemory: nav.deviceMemory,
            hardwareConcurrency: nav.hardwareConcurrency,
            language: nav.language,
            maxTouchPoints: nav.maxTouchPoints,
            platform: nav.platform
        }
        console.log(fp)
        const [deviceHash, fpHash] = await Promise.all([
            hashify(device),
            hashify(fp)
        ])
		
		// await post fp hash to server
		// if new, then append row and return timestamp (new)
		// if not new, then get/return onld timestamp (insert new timestamp)
		
        data = `
			<section>
				<style>
					#fingerprint-data {
						box-sizing: border-box;
						margin: 0 auto;
					  	max-width: 700px;
					}
					#fingerprint-data > div {
					  	color: #2c2f33;
						overflow-wrap: break-word;
						padding: 10px;
						margin: 10px 0;
						box-shadow: 0px 2px 2px 0px #cfd0d1;
					}
					#fingerprint-data h1,
					#fingerprint-data h2 {
						color: #2d3657;
						text-align: center;
					}
					.device {
						background: #7289da3b;
					}
				</style>
				
				<div id="fingerprint-data">
					<h1 class="visit">Your Fingerprint</h1>
					<h2 class="visit">last visit: ${new Date()}</h2>
					<div class="device">Device Id: ${deviceHash}</div>
					<div>Device/Browser Id: ${fpHash}</div>

					<div class="device">platform: ${nav.platform}</div>
					<div class="device">webgl renderer: ${webgl.renderer}</div>
					<div class="device">deviceMemory: ${nav.deviceMemory}</div>
					<div class="device">hardwareConcurrency: ${nav.hardwareConcurrency}</div>
					<div class="device">maxTouchPoints: ${nav.maxTouchPoints}</div>
					<div class="device">screen: ${fp.screen[1]}</div>
					<div class="device">media devices: ${fp.mediaDevices[1]}</div>
					<div class="device">language: ${nav.language}</div>
					<div class="device">timezone: ${fp.timezone}</div>

					<div>webglDataURL: ${fp.webglDataURL[1]}</div>
					<div>client rects: ${fp.cRects[1]}</div>
					<div>console errors: ${fp.consoleErrors[1]}</div>	
					<div>maths: ${fp.maths[1]}</div>
					<div>canvas: ${fp.canvas[1]}</div>
					<div>userAgent: ${nav.userAgent}</div>
					<div>appVersion: ${nav.appVersion}</div>	
					<div>mimeTypes: ${fp.mimeTypes[1]}</div>
					<div>plugins: ${fp.plugins[1]}</div>
					<div>voices: ${fp.voices[1]}</div>
					<div>webgl vendor: ${webgl.vendor}</div>
					<div>vendor: ${nav.vendor}</div>
					<div>doNotTrack: ${nav.doNotTrack}</div>
					<span>view the console for details</span>
				</div>
			</section>
		`
        return patch(fpElem, html `${data}`)
    }).catch((e) => console.log(e))
})()