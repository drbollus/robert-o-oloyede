/* ==========================================================================
   Dr. Robert Oloyede — shared navigation
   Defines <site-header> and <site-footer> custom elements so every page
   pulls the SAME nav links, CTA, and contact info from one place.

   Usage in any page's <body>:
     <site-header page="home"></site-header>   <!-- page = which link to mark active -->
     ...page content...
     <site-footer></site-footer>
     <script src="assets/js/nav.js" defer></script>

   To add/rename/reorder a page site-wide: edit NAV_LINKS below. That's it —
   every page's header updates automatically, no hunting through files.
   ========================================================================== */

const NAV_LINKS = [
  { key: "framework",  label: "Framework",  href: "framework.html" },
  { key: "experience", label: "Experience", href: "experience.html" },
  { key: "speaking",   label: "Speaking",   href: "speaking.html" },
  { key: "about",      label: "About",      href: "about.html" },
];

const CONTACT = {
  email: "Robert.Oloyede@theiam.org",       // TODO: replace with Dr. Oloyede's real contact email
  linkedin: "https://www.linkedin.com/in/robert-oloyede-mba-mnse-r-eng-a0519724/",
};

function linkHTML(link, currentPage, extraClass = "") {
  const isCurrent = link.key === currentPage;
  return `<a class="${extraClass}" href="${link.href}" ${isCurrent ? 'aria-current="page"' : ""}>${link.label}</a>`;
}

class SiteHeader extends HTMLElement {
  connectedCallback() {
    const currentPage = this.getAttribute("page") || "";
    const desktopLinks = NAV_LINKS.map((l) => linkHTML(l, currentPage)).join("");
    const mobileLinks = NAV_LINKS.map((l) => linkHTML(l, currentPage)).join("");

    this.innerHTML = `
      <header class="site-header">
        <div class="wrap nav-inner">
          <a class="brandmark" href="index.html" ${currentPage === "home" ? 'aria-current="page"' : ""}>
            <span class="dot"></span>ROBERT O. OLOYEDE
          </a>
          <nav><ul>${NAV_LINKS.map((l) => `<li>${linkHTML(l, currentPage)}</li>`).join("")}</ul></nav>
          <a class="btn-ghost nav-cta" href="contact.html" ${currentPage === "contact" ? 'aria-current="page"' : ""}>Get in touch</a>
          <button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false">&#9776;</button>
        </div>
        <div class="mobile-menu">
          ${mobileLinks}
          <a href="contact.html" ${currentPage === "contact" ? 'aria-current="page"' : ""}>Get in touch</a>
        </div>
      </header>
    `;

    const toggle = this.querySelector(".nav-toggle");
    const menu = this.querySelector(".mobile-menu");
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.innerHTML = open ? "&#10005;" : "&#9776;";
    });
  }
}

class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class="site-footer">
        <div class="wrap footer-inner">
          <span class="stamp">R.ENG &middot; MNSE &middot; DBA — DIVCON GROUP</span>
          <div class="footer-links">
            <a href="${CONTACT.linkedin}" target="_blank" rel="noopener">LinkedIn</a>
            <a href="mailto:${CONTACT.email}">Email</a>
            <a href="#top">Back to top</a>
          </div>
        </div>
      </footer>
    `;
  }
}

customElements.define("site-header", SiteHeader);
customElements.define("site-footer", SiteFooter);
