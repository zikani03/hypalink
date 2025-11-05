
class Hypalink extends HTMLElement {

	connectedCallback() {
		this._a = document.createElement('a');
		this._a.textContent = `${this.textContent}`;
		this._a.setAttribute("href", "#")
		this.textContent = "";
		this.buildLinkList();
		this._a.addEventListener("click", this.onLinkClicked.bind(this));
		this.appendChild(this._a);
	}
	
	buildLinkList() {
		this.listEl = document.createElement('ul');
		this.listEl.style = 'position: absolute; z-index: 99999; background: #efefef; padding: 7px 15px; border-radius: 15px; width: fit-content; list-style-type: none; box-shadow: 1px 1px 2px rgba(0,0,0,0.15);'
		this.listEl.classList.add('hypalink-list-hidden');
		this.links = [];
		this.extractLinks();
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
		for(var link of this.links) {
			const a = document.createElement("a");
			a.setAttribute("href", link)
			a.setAttribute("target", "_blank") // TODO: configurable
			a.textContent = link;
			const li = document.createElement("li");
			li.appendChild(a)
			liNodes.push(li)
		}
		this.listEl.append(...liNodes);
		this.appendChild(this.listEl)
	}
	
	extractLinks() {
		const srchrefs = this.getAttribute('srchrefs');
		if (srchrefs) {
			srchrefs.split(",")
				.filter(e => URL.canParse(e))
				.map(url => this.links.push(url));
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
						.map(entry => _that.links.push(entry["url"]))
				} else {
					const lines = `${data}`.split('\n');
					lines.filter(e => URL.canParse(e))
						.map(url => _that.links.push(url));
				}
			})
			.finally(_ => this.renderLinks())
		}
		
	}

	onLinkClicked(e) {
		e.preventDefault()
		const pos = document.caretPositionFromPoint(e.clientX, e.clientY);
		const rect = pos.getClientRect();
		this.listEl.style.left = `${rect.x - (this.listEl.clientWidth/3)}px`
		this.listEl.style.top = `${rect.y - (this.listEl.clientHeight*1.20)}px`
		this.listEl.classList.toggle('hypalink-list-hidden')
		return false;
	}
}

customElements.define("hypa-link", Hypalink)
// customElements.define("x-aa", Hypalink)