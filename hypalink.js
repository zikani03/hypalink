const _hypalinkCSS = `
.hypalink-list-visible {
    display: inline-block;
}

.hypalink-list-wrapper {
    position: absolute;
	z-index: 99999; background: #efefef;
	padding: 7px 15px; 
	border-radius: 15px; 
	width: fit-content; 
	list-style-type: none; 
	box-shadow: 1px 1px 2px rgba(0,0,0,0.15);
	max-height: 200px;
	overflow-y: scroll;
}

.hypalink-list-hidden {
    display: none;
}

.hypalink-popover {
    position: absolute;
    z-index: 10000;
    border-radius: 1.5rem;
    background-color: white;
    border: 1px solid #efefef;
    color: black;
    display: flex;
    gap: 2px;
    padding: 2px;
    width: fit-content;
}

.hypalink-popover button {
    border: none;
    background-color: #efefef;
    color: black;
    padding: 7px 15px;
    border-radius: inherit;
    cursor: pointer;
}

.hypalink-popover button:hover {
    background-color: #e9f1f9;
}

.hypalink-modal {
  border-radius: 1.5rem;
  background-color: white;
  border: 1px solid #efefef;
  color: black;
  height: 200px;
  max-height: 400px;
  max-width: 400px;
  padding: 2px;
  width: 500px;
}

.hypalink-modal > div {
	padding: 7px;
}
	

#__hypalink__modal__portal_over_9000z::backdrop {
  background: rgba(0, 0, 0, 0.16);
  backdrop-filter: blur(3px);
}

.hypalink-modal .hypalink-list-wrapper {
	z-index: 0; 
	background: none;
	padding: 7px 15px; 
	border-radius: none; 
	list-style-type: none; 
	box-shadow: none;
	min-height: inherit;
	width: 90%; 
	max-height: 80%;
	overflow-y: scroll;
}

`

const HYPALINK_MODAL_ID = '__hypalink__modal__portal_over_9000z';

class Hypalink extends HTMLElement {

	connectedCallback() {
		this._a = document.createElement('a');
		this._a.textContent = `${this.textContent}`;
		this._a.setAttribute("href", "#")
		this.modalEnabled = this.hasAttribute('modal');
		if (this.modalEnabled) {
			this.addModalElement();
		}
		this.buildLinkList();
		this._a.addEventListener("click", this.onLinkClicked.bind(this));
		this.appendChild(this._a);
		this.addCss()
	}

	addCss() {
		const hypalinkStylesheet = document.createElement('style')
		hypalinkStylesheet.innerText = _hypalinkCSS;
		this.parentElement.appendChild(hypalinkStylesheet)
	}

	buildLinkList() {
		this.listEl = document.createElement('ul');
		this.listEl.classList.add('hypalink-list-wrapper');
		this.listEl.classList.add('hypalink-list-hidden');
		this.links = []; // entries have shape: { url: "", text: "" }
		this.extractLinks();
		this._ul = this.listEl;
	}

	renderLinks() {
		if (this.links.length < 1) {
			const li = document.createElement("li");
			li.textContent = "No links found"
			li.style.color = 'red'
			this.listEl.appendChild(li)
			this.appendChild(this.listEl)
			return;
		}
		const liNodes = []
		for (var e of this.links) {
			const a = document.createElement("a");
			a.setAttribute("href", e["url"])
			a.setAttribute("target", "_blank") // TODO: configurable
			a.textContent = e["text"];
			const li = document.createElement("li");
			li.appendChild(a)
			liNodes.push(li)
		}
		this.listEl.append(...liNodes);
		this.appendChild(this.listEl)
	}
	
	addModalElement() {
		this._modalEl = document.getElementById(HYPALINK_MODAL_ID);
		if (!this._modalEl) {
			this._modalEl = document.createElement('dialog');
			this._modalEl.setAttribute('id', HYPALINK_MODAL_ID);
			this._modalContent = document.createElement('div');
			this._modalEl.appendChild(this._modalContent);
		} else{ 
			this._modalContent = this._modalEl.firstChild;
		}
		this._modalEl.classList.add('hypalink-modal');
		const body = document.querySelector('body');
		body.appendChild(this._modalEl);
	}

	extractLinks() {
		if (this.hasAttribute("label")) {
			const range = document.createRange()
			const _virtualInner = range.createContextualFragment(this.innerHTML);
			for (var c of _virtualInner.children) {
				if (c instanceof HTMLAnchorElement) {
					const url = c.getAttribute('href');
					if (url) {
						this.links.push({ url, text: c.textContent })
					}
				}
			}

			this.innerHTML = "";
			this._a.textContent = this.getAttribute('label') || 'Missing <code>label</code> attribute';
			
			this.renderLinks();
			return;
		}

		this.textContent = "";
		const srchrefs = this.getAttribute('srchrefs');
		if (srchrefs) {
			srchrefs.split(",")
				.filter(e => URL.canParse(e))
				.map(url => this.links.push({ url, text: url }));
			this.renderLinks();
		}

		const _that = this;
		const srcURL = this.getAttribute("src");
		if (srcURL) {
			const isJSON = srcURL.endsWith(".json"), isText = srcURL.endsWith(".txt");
			fetch(srcURL).then(response => {
				if (response.status !== 200) {
					return "failed to fetch source links"
				}
				if (isJSON) {
					return response.json()
				} else if (isText)
					return response.text()
				return "unsupported source type"
			}).then(data => {
				if (data instanceof Array) {
					// .filter(e => !e["url"])
					data.filter(e => URL.canParse(e["url"]))
						.map(entry => _that.links.push(entry))
				} else {
					const lines = `${data}`.split('\n');
					lines.filter(e => URL.canParse(e))
						.map(url => _that.links.push({ url, text: url }));
				}
			})
				.finally(_ => this.renderLinks())
		}

	}
	
	onShowModal() {
		const clonedList = this._ul.cloneNode(true);
		clonedList.classList.remove('hypalink-list-hidden');
		this._modalContent.replaceChildren(clonedList);
		const instruction = document.createElement('span');
		instruction.style.cursor = 'pointer';
		instruction.style.color = '#858585ff'
		instruction.addEventListener('click', (e) => {
			document.getElementById(HYPALINK_MODAL_ID).close();
		})
		instruction.innerText = "Click here or Press ESC (escape) to close the dialog"
		this._modalContent.appendChild(instruction)
		document.getElementById(HYPALINK_MODAL_ID).showModal();
	}

	onLinkClicked(e) {
		e.preventDefault()
		if (this.modalEnabled) {
			this.onShowModal()
			return false;
		}
		const pos = document.caretPositionFromPoint(e.clientX, e.clientY);
		const rect = pos.getClientRect();
		this.listEl.style.left = `${rect.x - (this.listEl.clientWidth / 3)}px`
		this.listEl.style.top = `${rect.y - (this.listEl.clientHeight * 1.20)}px`
		this.listEl.classList.toggle('hypalink-list-hidden')
		return false;
	}
}

customElements.define("hypa-link", Hypalink)