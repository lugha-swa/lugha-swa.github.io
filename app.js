/* ============================================================
   Swa — tabia za tovuti
   ------------------------------------------------------------
   Vitu vitatu: mandhari (mwanga/giza), menyu ya simu, na
   kunakili msimbo. Hakuna tegemeo la nje; kurasa zinafanya
   kazi bila skripti hii — inaimarisha tu.
   ============================================================ */

(function () {
  "use strict";

  /* Darasa la "js" linalofichua hali ya JS kwa CSS:
     bila JS, orodha ya urambazaji ya simu inabaki wazi. */
  document.documentElement.classList.add("js");

  function tayari(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  tayari(function () {
    mandhari();
    menyu();
    kunakili();
  });

  /* ------------------------------------------------------------
     Mandhari: mfumo kwanza, uchaguzi wa mtumiaji unahifadhiwa.
     Sifa ya data-mandhari inawekwa na skripti ndogo ya head
     (kabla ya CSS); kitufe hiki kinabadilisha tu.
     ------------------------------------------------------------ */
  function mandhari() {
    var kitufe = document.querySelector(".theme-toggle");
    if (!kitufe) { return; }

    var html = document.documentElement;
    var metaRangi = document.querySelector('meta[name="theme-color"]');

    function mandhariSasa() {
      return html.getAttribute("data-mandhari") === "giza" ? "giza" : "mwanga";
    }

    function sasishaKitufe() {
      var giza = mandhariSasa() === "giza";
      /* Maandishi yanaonyesha mandhari ya kwenda, si ya sasa */
      kitufe.textContent = giza ? "Nuru" : "Giza";
      kitufe.setAttribute("aria-pressed", giza ? "true" : "false");
      if (metaRangi) {
        metaRangi.setAttribute("content", giza ? "#16110A" : "#FAF7EF");
      }
    }

    sasishaKitufe();

    kitufe.addEventListener("click", function () {
      var ijayo = mandhariSasa() === "giza" ? "mwanga" : "giza";
      html.setAttribute("data-mandhari", ijayo);
      /* Hifadhi inaweza kukataa (dirisha la faragha) — hilo halifuti kubadilisha */
      try {
        window.localStorage.setItem("swa-mandhari", ijayo);
      } catch (e) {}
      sasishaKitufe();
    });
  }

  /* ------------------------------------------------------------
     Menyu ya simu: kitufe cha .nav-toggle kinafungua .nav.open.
     Escape na kubonyeza kiungo ndani kunafunga; focus inarejea.
     ------------------------------------------------------------ */
  function menyu() {
    var nav = document.querySelector(".nav");
    var kitufe = nav ? nav.querySelector(".nav-toggle") : null;
    if (!nav || !kitufe) { return; }

    function funga() {
      nav.classList.remove("open");
      kitufe.setAttribute("aria-expanded", "false");
    }

    kitufe.addEventListener("click", function () {
      var wazi = nav.classList.toggle("open");
      kitufe.setAttribute("aria-expanded", wazi ? "true" : "false");
    });

    document.addEventListener("keydown", function (tukio) {
      if (tukio.key === "Escape" && nav.classList.contains("open")) {
        funga();
        kitufe.focus();
      }
    });

    nav.addEventListener("click", function (tukio) {
      if (tukio.target.closest(".nav-link")) { funga(); }
    });
  }

  /* ------------------------------------------------------------
     Kunakili msimbo: kila kitufe cha .codeblock-copy kinachukua
     maandishi ya pre iliyo karibu. Ikiwa clipboard ya kisasa
     haipo, njia ya textarea ya muda + execCommand.
     Matokeo yanatangazwa kwa eneo la aria-live.
     ------------------------------------------------------------ */
  function kunakili() {
    var visima = document.querySelectorAll(".codeblock");
    for (var i = 0; i < visima.length; i++) {
      kunakiliKisima(visima[i]);
    }
  }

  function kunakiliKisima(kisima) {
    var kitufe = kisima.querySelector(".codeblock-copy");
    var msimbo = kisima.querySelector("pre");
    if (!kitufe || !msimbo) { return; }

    /* Eneo la kutangazia matokeo — linatengenezwa ikiwa halipo */
    var eneo = kisima.querySelector('[aria-live="polite"]');
    if (!eneo) {
      eneo = document.createElement("span");
      eneo.className = "sr-only";
      eneo.setAttribute("aria-live", "polite");
      var bar = kisima.querySelector("figcaption, .codeblock-bar");
      (bar || kisima).appendChild(eneo);
    }

    kitufe.addEventListener("click", function () {
      nakiliMaandishi(msimbo.textContent).then(function (imefanikiwa) {
        if (!imefanikiwa) { return; }

        kitufe.textContent = "Imenakiliwa";
        kitufe.classList.add("imenakiliwa");
        window.clearTimeout(kitufe._wakati);
        kitufe._wakati = window.setTimeout(function () {
          kitufe.textContent = "Nakili";
          kitufe.classList.remove("imenakiliwa");
        }, 2000);

        eneo.textContent = "Msimbo umenakiliwa";
        window.clearTimeout(eneo._wakati);
        eneo._wakati = window.setTimeout(function () {
          eneo.textContent = "";
        }, 1200);
      });
    });
  }

  function nakiliMaandishi(maandishi) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        return navigator.clipboard.writeText(maandishi).then(
          function () { return true; },
          function () { return false; }
        );
      } catch (e) {}
    }

    /* Njia ya zamani kwa http pekee na vivinjari vya kale */
    return new Promise(function (kamilisha) {
      var tmp = document.createElement("textarea");
      tmp.value = maandishi;
      tmp.setAttribute("readonly", "");
      tmp.style.position = "fixed";
      tmp.style.top = "0";
      tmp.style.left = "0";
      tmp.style.opacity = "0";
      document.body.appendChild(tmp);
      tmp.select();
      var imefanikiwa = false;
      try {
        imefanikiwa = document.execCommand("copy");
      } catch (e) {}
      document.body.removeChild(tmp);
      kamilisha(imefanikiwa);
    });
  }
})();
