$(function () {
  "use strict";

  var ENDPOINT = "php/FruitController.php";

  var $searchSelect = $("#searchSelect");
  var $replaceSelect = $("#replaceSelect");
  var $ledgerBody = $("#ledgerBody");
  var $burstLayer = $("#burstLayer");

  var $addInput = $("#addInput");
  var $replaceInput = $("#replaceInput");

  var $connectStatus = $("#connectStatus");
  var $addStatus = $("#addStatus");
  var $replaceStatus = $("#replaceStatus");

  var $deleteStatus = $("<p class='status' id='deleteStatus' role='status' aria-live='polite'></p>")
    .insertAfter($ledgerBody.closest("table"));

  var TRASH_ICON =
    "<svg class='trash' viewBox='0 0 24 24' width='18' height='18' fill='none' " +
    "stroke='currentColor' stroke-width='2' stroke-linecap='round' " +
    "stroke-linejoin='round' aria-hidden='true' focusable='false'>" +
      "<g class='trash__lid'><path d='M4 7h16'/><path d='M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2'/></g>" +
      "<g class='trash__can'><path d='M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12'/>" +
      "<path d='M10 11v6'/><path d='M14 11v6'/></g>" +
    "</svg>";

  var FRUIT_EMOJI = {
    apple: "\uD83C\uDF4E", "green apple": "\uD83C\uDF4F",
    orange: "\uD83C\uDF4A", tangerine: "\uD83C\uDF4A", mandarin: "\uD83C\uDF4A", clementine: "\uD83C\uDF4A", satsuma: "\uD83C\uDF4A",
    mango: "\uD83E\uDD6D",
    strawberry: "\uD83C\uDF53",
    pineapple: "\uD83C\uDF4D",
    guava: "\uD83C\uDF48",
    grape: "\uD83C\uDF47",
    kiwi: "\uD83E\uDD5D",
    cherry: "\uD83C\uDF52",
    banana: "\uD83C\uDF4C",
    watermelon: "\uD83C\uDF49",
    lemon: "\uD83C\uDF4B", lime: "\uD83C\uDF4B",
    peach: "\uD83C\uDF51", nectarine: "\uD83C\uDF51",
    pear: "\uD83C\uDF50",
    coconut: "\uD83E\uDD65",
    avocado: "\uD83E\uDD51",
    blueberry: "\uD83E\uDED0",
    melon: "\uD83C\uDF48", cantaloupe: "\uD83C\uDF48", honeydew: "\uD83C\uDF48", muskmelon: "\uD83C\uDF48",
    tomato: "\uD83C\uDF45",
    olive: "\uD83E\uDED2",
    kumquat: "\uD83C\uDF4A"
  };
  var FRUIT_EMOJI_KEYS = Object.keys(FRUIT_EMOJI).sort(function (a, b) {
    return b.length - a.length;
  });
  var FALLBACK_EMOJI = ["\uD83C\uDF4E", "\uD83C\uDF4A", "\uD83C\uDF47", "\uD83C\uDF53", "\uD83C\uDF4B"];

  function singularize(word) {
    if (/ies$/.test(word)) return word.replace(/ies$/, "y");
    if (/(sh|ch|x|s)es$/.test(word)) return word.replace(/es$/, "");
    if (/[^s]s$/.test(word)) return word.replace(/s$/, "");
    return word;
  }

  function emojiFor(name) {
    var raw = String(name).trim().toLowerCase();
    var singular = singularize(raw);

    if (FRUIT_EMOJI[raw]) return FRUIT_EMOJI[raw];
    if (FRUIT_EMOJI[singular]) return FRUIT_EMOJI[singular];

    for (var i = 0; i < FRUIT_EMOJI_KEYS.length; i++) {
      var known = FRUIT_EMOJI_KEYS[i];
      if (raw.indexOf(known) !== -1 || singular.indexOf(known) !== -1) {
        return FRUIT_EMOJI[known];
      }
    }
    var normalized = raw.replace(/[^a-z0-9]/g, "");
    var hash = 0;
    for (var c = 0; c < normalized.length; c++) {
      hash = (hash + normalized.charCodeAt(c)) % FALLBACK_EMOJI.length;
    }
    return FALLBACK_EMOJI[hash];
  }

  function celebrateFruit(name) {
    var emoji = emojiFor(name);
    var pieceCount = 16;
    var viewportWidth = $(window).width();

    for (var i = 0; i < pieceCount; i++) {
      var startX = Math.random() * viewportWidth;
      var driftEarly = (Math.random() - 0.5) * 120;
      var driftLate = driftEarly + (Math.random() - 0.5) * 200;
      var duration = 1.6 + Math.random() * 1.1;
      var delay = Math.random() * 0.35;
      var rotationEnd = 220 + Math.random() * 340;
      var size = 16 + Math.random() * 14;

      var $piece = $("<span class='burst-piece' aria-hidden='true'></span>")
        .text(emoji)
        .css({
          left: startX + "px",
          fontSize: size + "px",
          animationDuration: duration + "s",
          animationDelay: delay + "s"
        });

      $piece[0].style.setProperty("--dx-early", driftEarly + "px");
      $piece[0].style.setProperty("--dx-late", driftLate + "px");
      $piece[0].style.setProperty("--rot-end", rotationEnd + "deg");

      $burstLayer.append($piece);

      (function ($p, removeAfter) {
        setTimeout(function () { $p.remove(); }, removeAfter);
      })($piece, (duration + delay) * 1000 + 150);
    }
  }

  function showStatus($el, success, message) {
    $el.text(message || "")
      .removeClass("status--ok status--error is-fresh")
      .addClass(success ? "status--ok" : "status--error");

    void $el[0].offsetWidth;
    $el.addClass("is-fresh");
  }

  function call(action, params, done) {
    $.ajax({
      url: ENDPOINT,
      method: "POST",
      dataType: "json",
      data: $.extend({ action: action }, params || {})
    })
      .done(function (response) {
        done(response);
      })
      .fail(function () {
        done({ success: false, message: "Couldn't reach the server. Try again.", data: null });
      });
  }

  function renderFruits(rows, highlightName, newName) {
    $searchSelect.empty();
    $replaceSelect.empty();
    $ledgerBody.empty();

    rows.forEach(function (row) {
      var option = $("<option></option>").val(row.name).text(row.name);
      $searchSelect.append(option.clone());
      $replaceSelect.append(option);

      var isHighlighted = highlightName &&
        row.name.toLowerCase() === String(highlightName).toLowerCase();
      var isNew = newName &&
        row.name.toLowerCase() === String(newName).toLowerCase();

      var $tr = $("<tr></tr>")
        .toggleClass("is-highlighted", !!isHighlighted)
        .toggleClass("is-new", !!isNew);

      var $deleteBtn = $("<button type='button' class='row-delete'></button>")
        .attr("data-name", row.name)
        .attr("aria-label", "Delete " + row.name)
        .attr("title", "Delete " + row.name)
        .html(TRASH_ICON);
      var $nameCell = $("<td></td>").append(
        $("<div class='fruit-cell'></div>")
          .append($("<span class='fruit-cell__name'></span>").text(row.name))
          .append($deleteBtn)
      );

      $tr.append($("<td></td>").text(row.position));
      $tr.append($nameCell);
      $ledgerBody.append($tr);
    });

    if (highlightName) {
      var $target = $ledgerBody.find("tr.is-highlighted");
      if ($target.length) {
        $target[0].scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }

  function loadFruits(highlightName, newName) {
    call("list", {}, function (response) {
      if (response.success) {
        renderFruits(response.data, highlightName, newName);
      }
    });
  }

  function submitAdd() {
    var name = $addInput.val().trim();
    if (!name) {
      showStatus($addStatus, false, "Enter a fruit name.");
      return;
    }
    var $btn = $("#addBtn").prop("disabled", true);
    call("add", { name: name }, function (response) {
      $btn.prop("disabled", false);
      showStatus($addStatus, response.success, response.message);
      if (response.success) {
        $addInput.val("");
        loadFruits(null, response.data.name);
        celebrateFruit(response.data.name);
      }
    });
  }

  $("#addBtn").on("click", submitAdd);
  $addInput.on("keydown", function (e) {
    if (e.key === "Enter") submitAdd();
  });

  function submitReplace() {
    var oldName = $replaceSelect.val();
    var newName = $replaceInput.val().trim();

    if (!oldName) {
      showStatus($replaceStatus, false, "Select a fruit to replace.");
      return;
    }
    if (!newName) {
      showStatus($replaceStatus, false, "Enter a new fruit name.");
      return;
    }

    var $btn = $("#replaceBtn").prop("disabled", true);
    call("replace", { oldName: oldName, newName: newName }, function (response) {
      $btn.prop("disabled", false);
      showStatus($replaceStatus, response.success, response.message);
      if (response.success) {
        $replaceInput.val("");
        loadFruits(response.data.name);
      }
    });
  }

  $("#replaceBtn").on("click", submitReplace);
  $replaceInput.on("keydown", function (e) {
    if (e.key === "Enter") submitReplace();
  });

  $ledgerBody.on("click", ".row-delete", function () {
    var $btn = $(this);
    var name = $btn.attr("data-name");

    if (!window.confirm("Delete " + name + "?")) return;

    $btn.prop("disabled", true);
    call("delete", { name: name }, function (response) {
      showStatus($deleteStatus, response.success, response.message);
      if (response.success) {
        $btn.closest("tr").addClass("is-removing");
        setTimeout(function () { loadFruits(); }, 320);
      } else {
        $btn.prop("disabled", false);
      }
    });
  });

  $("#connectBtn").on("click", function () {
    var name = $searchSelect.val();
    if (!name) {
      showStatus($connectStatus, false, "Select a fruit first.");
      return;
    }
    var $btn = $(this).prop("disabled", true);
    call("connect", { name: name }, function (response) {
      $btn.prop("disabled", false);
      showStatus($connectStatus, response.success, response.message);
      if (response.success) {
        loadFruits(response.data.name);
      }
    });
  });

  $("#addBtn, #replaceBtn, #connectBtn").on("click", function () {
    var $b = $(this).removeClass("is-jelly");
    void this.offsetWidth;
    $b.addClass("is-jelly");
    setTimeout(function () { $b.removeClass("is-jelly"); }, 520);
  });

  loadFruits();
});