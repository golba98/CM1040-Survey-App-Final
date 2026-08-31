(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e={bandwidth:{key:`bandwidth`,number:`01`,range:`2006–2012`,href:`index.html`,title:`Breaking the Bandwidth Bottleneck`,summary:`Dedicated national research backbones and new undersea optical cables ended decades of bandwidth scarcity and transformed data delivery across South Africa.`,mainPoint:`Before widespread public access could emerge, South Africa had to break international bandwidth monopolies and construct high-capacity national fiber backbones.`,baselineContext:`Prior to 2006, South Africa relied almost exclusively on Telkom’s SAT-3 cable, suffering from severe bandwidth caps, high international transit costs, and limited academic connectivity.`,terms:[{term:`Submarine Optical Cable`,category:`International Infrastructure`,definition:`Deep-sea fiber-optic cable systems carrying terabits of transoceanic internet traffic between continents.`},{term:`SANReN & TENET`,category:`Research Networks`,definition:`South African National Research Network and Tertiary Education and Research Network, providing dedicated high-speed gigabit backbones for universities and science councils.`},{term:`Commercial LTE (4G)`,category:`Mobile Radio`,definition:`Long-Term Evolution cellular standard enabling broadband data speeds on handheld mobile devices without fixed lines.`},{term:`Route Diversity`,category:`Resilience`,definition:`Connecting multiple independent physical cable landings on different coasts to prevent complete national blackouts during subsea cable cuts.`}],events:[{year:`2008`,tag:`Research Collaboration`,title:`TENET and CSIR Sign SANReN Agreement`,text:`The formal collaboration created the foundation for South Africa’s dedicated national research network, securing long-term high-speed circuits for tertiary education.`},{year:`2009`,tag:`International Subsea`,title:`SEACOM Lands on the East Coast`,text:`Going live on 23 July 2009 at Mtunzini (KwaZulu-Natal), the 17,000 km private subsea system introduced 1.28 Tbps design capacity, ending the SAT-3 monopoly.`},{year:`2010`,tag:`National Backbone`,title:`Commissioning of 10 Gbps Metro Rings`,text:`SANReN completed high-speed metropolitan fiber rings across Johannesburg, Pretoria, Cape Town, and Durban, interconnecting research hubs at gigabit speeds.`},{year:`2012`,tag:`West Coast Diversity & 4G`,title:`WACS Cable Launches & Commercial LTE Begins`,text:`The West Africa Cable System (WACS) landed at Yzerfontein on 11 May 2012 with Broadband Infraco holding 11.4% capacity. Simultaneously, Vodacom launched South Africa’s first commercial LTE service on 10 October 2012.`}],sections:[{title:`The Inherited Constraints of 2006`,text:`At the start of 2006, South Africa’s internet access was constrained by reliance on a single submarine route (SAT-3) and monopolistic bandwidth pricing. Individual internet adoption was limited to approximately 15.0% of the population aged 15 and older, concentrated in commercial and affluent urban centers.`},{title:`Building the National Research Backbone`,text:`Recognizing that scientific and higher education institutions could not afford commercial retail bandwidth, the CSIR and TENET initiated SANReN in 2008. By December 2009, a 10 Gbps national ring connected Pretoria, Johannesburg, Bloemfontein, Cape Town, Gqeberha, East London, and Durban.`},{title:`Undersea Cable Competition and Route Diversity`,text:`The arrival of SEACOM in 2009 on the east coast and WACS in 2012 on the west coast multiplied international bandwidth by orders of magnitude. While wholesale transit prices dropped significantly, retail pricing and local last-mile distribution remained key hurdles for everyday citizens.`}],metrics:[{value:`15.0%`,label:`Individual Internet Access (2007 Baseline)`,scale:15,unit:`Population 15+`},{value:`33.7%`,label:`Individual Internet Access (2012)`,scale:33.7,unit:`Population 15+`},{value:`1.28 Tbps`,label:`SEACOM Initial Design Capacity (2009)`,scale:50,unit:`East Coast Subsea`},{value:`10 Gbps`,label:`SANReN National Backbone Core (2009)`,scale:40,unit:`National Research Ring`}],connectionPath:[{step:`01`,title:`Subsea Landings`,desc:`SEACOM (Mtunzini) & WACS (Yzerfontein) bring multi-terabit optical transit.`},{step:`02`,title:`National Backbone`,desc:`SANReN & carrier long-haul dark fiber rings connect all major metros.`},{step:`03`,title:`Metropolitan Rings`,desc:`10 Gbps rings distribute high-speed capacity to research and data centers.`},{step:`04`,title:`Commercial Cellular Edge`,desc:`Initial LTE base stations deliver first commercial 4G mobile broadband.`}],visualLabel:`International submarine cables land on east and west coasts, linking through 10 Gbps national backbones to major cities.`,sources:[`Statistics South Africa (MDG Goal 8 Report)`,`TENET & SANReN Infrastructure Archive`,`South African Government Yearbook (2009/2010)`,`SANews (WACS Launch 2012)`,`Vodacom Group Integrated Annual Report (2013)`]},local:{key:`local`,number:`02`,range:`2013–2019`,href:`mobile-local.html`,title:`Broadband Becomes Mobile and Local`,summary:`Smartphones, open-access suburban fiber, public Wi-Fi programs, and university network extensions brought high-speed data directly to everyday users, while affordability emerged as the central debate.`,mainPoint:`International backbones became meaningful to citizens when connectivity expanded through cellular handsets, neighborhood fiber, and municipal public hotspots.`,baselineContext:`By 2013, the majority of connected South Africans bypassed fixed desktop computers entirely, relying on mobile phones as their primary internet gateway.`,terms:[{term:`Mobile-First Access`,category:`User Adoption`,definition:`Internet access primarily conducted via handheld cellular devices rather than fixed household telephone lines or dedicated desktop routers.`},{term:`Open-Access FTTH`,category:`Urban Infrastructure`,definition:`Fibre-to-the-Home infrastructure owned by a neutral network operator allowing multiple independent ISPs to offer competing retail services.`},{term:`Municipal Public Wi-Fi`,category:`Public Connectivity`,definition:`Government-funded wireless hotspots in public squares, transport hubs, and township facilities offering free daily data allocations.`},{term:`Data Services Market Inquiry`,category:`Regulatory Policy`,definition:`Competition Commission investigation (2017–2019) that uncovered excessive mobile data prices, especially for lower-income prepaid consumers.`}],events:[{year:`2013`,tag:`Policy & Municipal Wi-Fi`,title:`SA Connect Adopted & Tshwane Free Wi-Fi Deployed`,text:`Cabinet approved the SA Connect national broadband policy in December 2013. Simultaneously, the City of Tshwane launched Phase 1 of its free Wi-Fi network across Soshanguve, Mamelodi, and Atteridgeville.`},{year:`2014`,tag:`Fibre to the Home`,title:`Parkhurst Open-Access FTTH Pilot`,text:`Vumatel launched a community-driven open-access fiber project in Parkhurst, Johannesburg, sparking a nationwide suburban race to replace legacy copper ADSL with gigabit fiber.`},{year:`2017`,tag:`Policy Realignment`,title:`SA Connect Phase 1 Downscaled to 970 Sites`,text:`Budget limits forced the Department of Communications to downscale SA Connect Phase 1 from 6,135 rural public facilities to 970 anchor-tenant sites in eight district municipalities.`},{year:`2019`,tag:`Affordability & Dark Fibre`,title:`Competition Commission Findings & Rural Campus Links`,text:`The Competition Commission published its final Data Services Market Inquiry report ordering major operators to lower prepaid mobile data pricing. TENET completed its decade-long Rural Campuses Connection Project, connecting all public universities with at least 10 Gbps.`}],sections:[{title:`The Mobile-First Transition`,text:`In 2013, Statistics South Africa documented a fundamental shift: over 30% of households reported using mobile devices for internet access, compared to barely 10% with a fixed home connection. The mobile phone had become the dominant instrument of digital participation in South Africa.`},{title:`Municipal Hotspots and Suburban Fibre`,text:`To address access gaps, municipal initiatives like Tshwane’s Project Isizwe provided free public Wi-Fi quotas in townships. In affluent suburbs, community associations bypassed legacy Telkom copper by commissioning open-access FTTH networks, drastically reducing residential per-gigabyte costs.`},{title:`The Prepaid Data Penalty and Regulatory Action`,text:`Despite expanding 3G and 4G coverage, the Competition Commission’s 2019 inquiry revealed that poorer prepaid subscribers paid significantly higher effective per-megabyte rates than postpaid contract customers, highlighting that physical coverage did not equal equitable affordability.`}],metrics:[{value:`30.8%`,label:`Households with Mobile Internet Access (2013)`,scale:31,unit:`Stats SA GHS`},{value:`10.0%`,label:`Households with Fixed Internet at Home (2013)`,scale:10,unit:`Stats SA GHS`},{value:`560,000+`,label:`Tshwane Free Wi-Fi Registered Users (2015)`,scale:56,unit:`Municipal Registrations`},{value:`10 Gbps`,label:`Minimum Speed for All Public University Campuses (2019)`,scale:40,unit:`TENET RCCP Milestone`}],connectionPath:[{step:`01`,title:`Carrier Core & NREN`,desc:`Dark fiber trunk lines link university campuses and major city interchanges.`},{step:`02`,title:`Open-Access FTTH`,desc:`Neutral neighborhood fiber networks bring gigabit speeds to homes and businesses.`},{step:`03`,title:`Public Wi-Fi Mesh`,desc:`Municipal hotspots provide daily data quotas at schools, clinics, and transit hubs.`},{step:`04`,title:`Cellular 3G/4G Towers`,desc:`Mobile networks provide the primary data connection for over 70% of households.`}],visualLabel:`National fiber trunks branch into suburban open-access FTTH, municipal public Wi-Fi nodes, and cellular towers.`,sources:[`Statistics South Africa (GHS 2013 & ICT Indicators)`,`Department of Communications and Digital Technologies (SA Connect)`,`City of Tshwane (Mayoral Address on Free Wi-Fi 2015)`,`Competition Commission of South Africa (Data Services Market Inquiry 2019)`,`TENET Rural Campuses Connection Project Final Report (2019)`]},divide:{key:`divide`,number:`03`,range:`2020–2026`,href:`digital-divide.html`,title:`5G, New Mega-Cables and the Digital Divide`,summary:`Next-generation 5G networks, historic spectrum auctions, and massive subsea cables drove total household access above 82%, yet sharp geographic and economic inequalities persist.`,mainPoint:`Infrastructure expansion and headline coverage statistics must not obscure the stark divide between mobile data subsistence and uncapped fixed-fiber abundance.`,baselineContext:`By 2024, more than 8 out of 10 households had at least one member accessing the internet, but only 17.4% enjoyed a fixed, uncapped connection at home.`,terms:[{term:`Any Household Access`,category:`Statistical Measure`,definition:`Measure indicating whether any household member accessed the internet anywhere (including mobile, work, or public spots); not equivalent to home broadband.`},{term:`Fixed-Home Access`,category:`Infrastructure Class`,definition:`Dedicated uncapped or high-capacity connection installed inside the residence (FTTH, fixed-wireless, or copper), enabling reliable telecommuting and learning.`},{term:`High-Demand Spectrum`,category:`Radio Regulation`,definition:`Crucial radio frequency bands (700 MHz, 800 MHz, 2.6 GHz, 3.5 GHz) auctioned by ICASA in 2022 to drastically increase 4G/5G mobile network capacity.`},{term:`Mega Subsea Cables`,category:`International Scale`,definition:`High-fiber-count systems like Google Equiano and Meta 2Africa supporting up to 180 Tbps capacity, dwarfing all previous generations combined.`}],events:[{year:`2020`,tag:`Emergency 5G Spectrum`,title:`COVID-19 Emergency Spectrum & Commercial 5G Launch`,text:`During the national disaster, ICASA allocated emergency temporary spectrum. Vodacom and MTN launched commercial mobile and fixed-wireless 5G across Johannesburg, Pretoria, and Cape Town.`},{year:`2022`,tag:`Spectrum Auction & Equiano`,title:`Historic R14.4B Spectrum Auction & Equiano Landing`,text:`In March 2022, ICASA completed the historic high-demand spectrum auction raising R14.4 billion across six operators. In August 2022, Google’s Equiano cable landed at Melkbosstrand, offering 144 Tbps design capacity.`},{year:`2024`,tag:`Official Household Data`,title:`Stats SA GHS Records 82.1% Access but Deep Provincial Divide`,text:`The 2024 General Household Survey documented 82.1% national access (75.6% mobile, 17.4% fixed home). Fixed-home access reached 44.9% in the Western Cape but plummeted to 8.0% in the Eastern Cape.`},{year:`2025–2026`,tag:`Subsea Completion & Resilience`,title:`Meta 2Africa Core Completion & Power Resilience Upgrades`,text:`Meta announced completion of the 2Africa trunk system with four South African landing points (Yzerfontein, Duynefontein, Gqeberha, Amanzimtoti), while operators invested billions in solar and battery backup to withstand grid load-shedding.`}],sections:[{title:`The 5G Spectrum Breakthrough`,text:`After more than a decade of regulatory delays, the 2022 spectrum auction freed essential sub-1GHz and mid-band radio frequencies. Combined with the Equiano and 2Africa submarine systems, national transit capacity reached unprecedented scale.`},{title:`Dissecting the 82.1% Access Statistic`,text:`While headline statistics celebrate 82.1% household internet access, this number is heavily driven by metered mobile data (75.6%). Only 17.4% of South African households have a fixed broadband connection at home, meaning the majority remain subject to data capping, high out-of-bundle costs, and battery depletion during grid instability.`},{title:`The Provincial and Rural Reality`,text:`The digital divide in South Africa is deeply spatial. While 44.9% of Western Cape households enjoy fixed-home internet, only 8.0% of Eastern Cape households have the same privilege. ICASA reports rural Eastern Cape 5G coverage at merely 1%, contrasting sharply with 33% in urban centers.`}],metrics:[{value:`82.1%`,label:`Households with Any Internet Access (2024 National)`,scale:82.1,unit:`National Total`},{value:`75.6%`,label:`Households Relying on Mobile Internet (2024)`,scale:75.6,unit:`Cellular Dependent`},{value:`17.4%`,label:`Households with Fixed Internet at Home (2024)`,scale:17.4,unit:`National Fixed-Line/FTTH`},{value:`44.9%`,label:`Western Cape Fixed-Home Internet Access`,scale:44.9,unit:`Provincial Leader`},{value:`8.0%`,label:`Eastern Cape Fixed-Home Internet Access`,scale:8,unit:`Deep Rural Gap`},{value:`1.0%`,label:`Eastern Cape Rural 5G Coverage (2023)`,scale:1,unit:`ICASA Licensee Report`}],connectionPath:[{step:`01`,title:`Mega Subsea (180 Tbps)`,desc:`Equiano & 2Africa land at Melkbosstrand, Duynefontein, Gqeberha, and Amanzimtoti.`},{step:`02`,title:`Auctioned Spectrum`,desc:`700/800 MHz and 3.5 GHz bands deployed on cellular towers with battery backup.`},{step:`03`,title:`Urban 5G & Gigabit FTTH`,desc:`Metropolitan centers experience fast uncapped broadband and dense 5G coverage.`},{step:`04`,title:`Rural & Township Fringe`,desc:`Prepaid 3G/4G and sparse public Wi-Fi remain the fragile primary connection.`}],visualLabel:`National headline access (82.1%) is compared against fixed-home access (17.4%) and the rural Eastern Cape divide (8.0%).`,sources:[`Statistics South Africa (General Household Survey 2024, Release P0318)`,`ICASA State of the ICT Sector Report (March 2024)`,`ICASA High-Demand Spectrum Auction Outcome (March 2022)`,`Meta 2Africa Cable Core Completion Release (November 2025)`,`WIOCC & Google Equiano Submarine Cable Announcement (2022)`]}},t=[`bandwidth`,`local`,`divide`];function n(n){return t.map(t=>{let r=e[t],i=t===n?` aria-current="page"`:``;return`
      <a class="nav-link" href="${r.href}"${i} title="${r.number} · ${r.range}: ${r.title}">
        <span>${r.range}</span>
      </a>`}).join(``)}function r(e){return e.map(e=>`<li>${e}</li>`).join(``)}function i(){let e=localStorage.getItem(`theme`);return e===`dark`||e===`light`?e:window.matchMedia(`(prefers-color-scheme: dark)`).matches?`dark`:`light`}function a(e){document.documentElement.setAttribute(`data-theme`,e),localStorage.setItem(`theme`,e);let t=document.querySelector(`#theme-toggle`);if(t){let n=e===`dark`;t.setAttribute(`aria-label`,n?`Switch to light theme`:`Switch to dark theme`);let r=t.querySelector(`.theme-icon`),i=t.querySelector(`.theme-label`);r&&(r.textContent=n?`☀️`:`🌙`),i&&(i.textContent=n?`Light`:`Dark`)}}function o(){a(i());let e=document.querySelector(`#theme-toggle`);e&&e.addEventListener(`click`,()=>{a((document.documentElement.getAttribute(`data-theme`)||i())===`dark`?`light`:`dark`)}),window.matchMedia(`(prefers-color-scheme: dark)`).addEventListener(`change`,e=>{localStorage.getItem(`theme`)||a(e.matches?`dark`:`light`)})}function s({designId:t,designName:i,renderPage:a}){let s=document.body.dataset.page,c=e[s],l=document.querySelector(`#app`);if(!c||!l){document.body.textContent=`The requested prototype page could not be loaded.`;return}document.title=`${c.range} — ${c.title} | ${i}`,document.documentElement.dataset.design=t,l.innerHTML=`
    <a class="skip-link" href="#main">Skip to main content</a>
    <header class="site-header">
      <div class="header-container">
        <a class="brand" href="index.html">
          Connected <span class="brand-accent">South Africa</span>
        </a>

        <div class="header-controls">
          <nav id="site-nav" class="site-nav" aria-label="Era Navigation">
            ${n(s)}
          </nav>
          <button id="theme-toggle" class="theme-toggle-btn" type="button" aria-label="Toggle theme">
            <span class="theme-icon" aria-hidden="true">🌙</span>
            <span class="theme-label">Dark</span>
          </button>
          <button class="menu-toggle-btn" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Toggle navigation menu">
            Menu
          </button>
        </div>
      </div>
    </header>

    <main id="main">
      ${a(c)}
    </main>

    <footer class="site-footer">
      <div class="footer-container">
        <div class="footer-sources">
          <h3>Historical & Regulatory Sources</h3>
          <ul class="sources-list">${r(c.sources)}</ul>
        </div>
        <div class="footer-meta">
          <p><strong>CM1040 Web Development Final Project</strong></p>
          <p>Department of Computing · Goldsmiths, University of London</p>
          <p>Historical research on South African telecommunications infrastructure (2006–2026). Layout prototype evaluating usability, accessible structure, and responsive theme adaptation.</p>
        </div>
      </div>
    </footer>`,o();let u=l.querySelector(`.menu-toggle-btn`),d=l.querySelector(`#site-nav`);u&&d&&(u.addEventListener(`click`,()=>{let e=u.getAttribute(`aria-expanded`)===`true`;u.setAttribute(`aria-expanded`,String(!e)),u.textContent=e?`Menu`:`Close`,d.classList.toggle(`is-open`,!e)}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&d.classList.contains(`is-open`)&&(u.setAttribute(`aria-expanded`,`false`),u.textContent=`Menu`,d.classList.remove(`is-open`),u.focus())}))}var c=e=>e.map(e=>`
  <li class="field-note-item">
    <div class="field-note-date">${e.year}</div>
    <div class="field-note-content">
      <span class="field-note-badge">${e.tag}</span>
      <h4 class="field-note-title">${e.title}</h4>
      <p class="field-note-text">${e.text}</p>
    </div>
  </li>`).join(``),l=e=>e.map((e,t)=>`
  <details class="editorial-accordion"${t===0?` open`:``}>
    <summary class="accordion-summary">
      <span class="summary-term">${e.term}</span>
      <span class="summary-cat">${e.category}</span>
    </summary>
    <div class="accordion-panel">
      <p>${e.definition}</p>
    </div>
  </details>`).join(``);function u(e){return`
    <article class="editorial-feature">
      <header class="editorial-header">
        <p class="editorial-kicker">Special Report · Chapter ${e.number}</p>
        <h1 class="editorial-headline">${e.title}</h1>
        <p class="editorial-deck">${e.summary}</p>
        <div class="editorial-byline">
          <span class="byline-item">Topic: <strong>${e.range} Infrastructure Analysis</strong></span>
          <span class="byline-item">Author: <strong>Jordan Vorster</strong></span>
          <span class="byline-item">Research: <strong>CM1040 Academic Investigation</strong></span>
        </div>
      </header>

      <!-- Tri-Pillar Visual Summary -->
      <section class="editorial-visual-banner" aria-label="Visual Analysis Pillars">
        <div class="visual-pillar">
          <span class="pillar-num">01</span>
          <span class="pillar-label">International Transit</span>
          <span class="pillar-sub">Subsea optical landings & high-capacity pipes</span>
        </div>
        <div class="visual-pillar">
          <span class="pillar-num">02</span>
          <span class="pillar-label">National Routing</span>
          <span class="pillar-sub">SANReN backbone ring & dark fiber interconnects</span>
        </div>
        <div class="visual-pillar">
          <span class="pillar-num">03</span>
          <span class="pillar-label">Citizen Access</span>
          <span class="pillar-sub">Cellular 4G expansion & suburban fiber networks</span>
        </div>
        <p class="visual-caption"><strong>Analysis:</strong> ${e.visualLabel}</p>
      </section>

      <hr class="section-rule" />

      <!-- Narrative Chapters -->
      <section class="narrative-body" aria-label="Narrative Analysis">
        ${e.sections.map((e,t)=>`
          <div class="story-chapter">
            <div class="chapter-num" aria-hidden="true">${String(t+1).padStart(2,`0`)}</div>
            <div class="chapter-content">
              <h2 class="chapter-title">${e.title}</h2>
              <p class="chapter-prose">${e.text}</p>
            </div>
          </div>`).join(``)}
      </section>

      <!-- Editorial Pullquote -->
      <aside class="editorial-pullquote" aria-label="Investigative Quote">
        <p>${e.mainPoint}</p>
        <cite>— CM1040 Analytical Synthesis (${e.range})</cite>
      </aside>

      <hr class="section-rule" />

      <!-- Analytical Field Notes & Collapsible Lexicon -->
      <section class="editorial-two-col">
        <div class="field-notes-col">
          <span class="section-overline">Field Chronology</span>
          <h3 class="section-title">Archival Notes</h3>
          <p class="section-subtitle">Chronological field recordings and regulatory records.</p>
          <ul class="field-notes-list">
            ${c(e.events)}
          </ul>
        </div>

        <div class="lexicon-col">
          <span class="section-overline">Reference Archive</span>
          <h3 class="section-title">Technical Lexicon</h3>
          <p class="section-subtitle">Domain concepts explained for public understanding.</p>
          <div class="accordion-group">
            ${l(e.terms)}
          </div>
        </div>
      </section>
    </article>`}s({designId:`editorial`,designName:`Editorial Story Model`,renderPage:u});