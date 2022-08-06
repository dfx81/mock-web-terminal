let typer = document.querySelector("#typer");
let texter = document.querySelector("#texter");
let cursor = document.querySelector(".cursor");
let prompt = document.querySelector("#command");
let terminal = document.querySelector(".terminal");
let form = document.querySelector("form");
let title = document.querySelector(".title");

let history = [];

let cart = "";

let debug = false;
let line = 0;

let debugWin = null;

let banner = '<h1 style="margin:0px; white-space:nowrap;">DFX\'s SPACE</h1><pre id="history">オフィシャルサイト\n\nDFX-81 V1.00-0\n(C) 2019-2022, DANIAL FITRI.\nALL RIGHTS RESERVED.\n\n\nTYPE HELP FOR HELP</pre>'

window.onload = () => {
  if (!window.localStorage.getItem("$MOTD") || window.localStorage.getItem("$MOTD").toString().toUpperCase() === "TRUE") {
    insert(banner + "<br/>");
  }

  texter.value = "";
  typer.value = texter.value;

  if (window.localStorage.getItem("$USER")) {
    title.innerText = window.localStorage.getItem("$USER");
  }

  texter.addEventListener("keydown", evt => type(evt));
  texter.addEventListener("keyup", () => changePrompt());
  form.addEventListener("submit", enter);
}

function type(e) {
  console.log(e);

  switch (e.key) {
    case "ArrowLeft":
    case "ArrowRight":
    case "ArrowUp":
    case "ArrowDown":
      e.preventDefault();
      break;
  }

  changePrompt();
}

function changePrompt() {
  typer.value = texter.value;
  typer.innerText = typer.value;

  cursor.scrollIntoView(false);
  terminal.scrollBy(0, terminal.getBoundingClientRect().height);
  document.body.scrollBy(0, document.body.offsetHeight);
}

function enter(e) {
  e.preventDefault();
  
  sendDebugInfo(typer.value + " : " + texter.value);

  insert(typer.value, { echo: true, unsafe: true });
  typer.value = typer.value.trim();
  let cmd = typer.value;
  texter.value = "";
  command(cmd);
  changePrompt();
}

function command(cmd) {
  let args = cmd.split(" ");
  let out = "";

  sendDebugInfo(args, {prefix:"CMD:"});

  switch (args[0].toUpperCase()) {
    case "HELP":
      out += "<br/>COMMANDS:<br/>";
      out += " * HELP: You're looking at one right now :-)<br/>";
      out += " * CLEAR: Clear the console<br/>";
      out += " * BANNER: Show the banner<br/>";
      out += " * SET: Adjust settings<br/>";
      out += " * RELOAD: Reload console<br/>";
      out += " * ABOUT: Learn about dfx<br/>";
      out += " * CONTACT: How to find dfx<br/>";
      out += " * LOAD: Load a cart<br/>";
      out += " * RUN: Run loaded cart<br/>";
      out += " * ROLL: Perform a roll<br/>";
      break;
    case "CLEAR":
      clear();
      return;
    case "BANNER":
      insert("<br/>" + banner);
      break;
    case "SET":
      if (args.length == 1) {
        out += "<br/>AVAILABLE SETTINGS:<br/>";
        out += "  * --USER: Set new username (DEFAULT=GUEST)<br/>";
        out += "  * --MOTD: Set whether to show banner on startup (DEFAULT=TRUE)<br/><br/>"
        out += "TYPE `SET --&lt;OPTIONS&gt;=[NEW-VALUE]` TO CHANGE SETTINGS.<br/>";
      } else {
        for (i = 1; i < args.length; i++) {
          let setting = args[i].split("=");

          switch (setting[0].toUpperCase()) {
            case "--USER":
              if (setting.length == 2) {
                window.localStorage.setItem("$USER", setting[1]);
                title.innerText = setting[1];
                out += "<br/>NEW USERNAME SET.<br/>"
              } else {
                out += "<br/>NO VALID VALUE GIVEN FOR $USER.<br/>"
              }
              break;
            case "--MOTD":
              if (setting.length == 2 && (setting[1].toUpperCase() === "TRUE" || setting[1].toUpperCase() === "FALSE")) {
                window.localStorage.setItem("$MOTD", setting[1]);
                out += "<br/>BANNER SETTINGS CHANGED.<br/>"
              } else {
                out += "<br/>NO VALID VALUE GIVEN FOR $MOTD.<br/>"
              }
              break;
            default:
              if (setting[0].includes("--")) {
                insert("<br/>");
                insert("SETTING " + setting[0] + " NOT FOUND.", { unsafe: true });
              } else {
                out += "<br/>INVALID ARGS.<br/>";
              }
          }
        }
      }
      break;
    case "RELOAD":
      insert("<br/>RELOADING CONSOLE...<br/>");
      window.setTimeout(() => window.location.reload(), 500);
      break;
    case "ABOUT":
      out += "<br/>ABOUT ME:<br/>";
      out += "<p>I'm a programmer based in Malaysia.<br/>I'm experienced in desktop, mobile, and web development.<br/>I also draw and create games on my free time.</p>";
      break;
    case "CONTACT":
      out += "<br/>CONTACTS:<br/>";
      out += "  * EMAIL: danialfitrighazali AT gmail DOT com<br/>";
      out += "  * GITHUB: <a href='https://github.com/dfx81'>@dfx81</a><br/>";
      out += "  * INSTAGRAM: <a href='https://instagram.com/dfx_81'>@dfx_81</a><br/>";
      break;
    case "ROLL":
      out += '<br/><div class="container landscape"><iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ?controls=0&autoplay=1" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div><br/>';
      out += "<br/>ROLL SUCCESSFUL.<br/>";
      break;
    case "LOAD":
      if (args.length == 1) {
        out += "<br/>AVAILABLE CARTS:<br/>";
        out += "  * PONG.cart<br/><br/>";
        out += "TYPE `LOAD &lt;CART-NAME.cart&gt;` TO LOAD CART.<br/>";
      } else {
        switch (args[1].toUpperCase()) {
          case "PONG":
          case "PONG.CART":
            cart = "https://dfx81.github.io/Games/Pong.html?orientation=2";
            out += "<br/>PONG.cart LOADED.<br/><br/>TYPE RUN TO START.<br/>";
            break;
          default:
            insert("<br/>");
            insert(args[1] + ": CART NOT FOUND.", { unsafe: true });
            out += "<br/>TYPE LOAD FOR CART LIST.<br/>";
        }
      }
      break;
    case "RUN":
      if (cart === "") {
        out += "<br/>NO CART LOADED.<br/>";
      } else {
        let orientation = "";
        let letterbox = "";

        if (cart.includes("orientation=1") || args.length > 1 && args.includes("--landscape")) {
          orientation = "landscape";
        } else if (cart.includes("orientation=2") || args.length > 1 && args.includes("--portrait")) {
          orientation = "portrait";
        }

        if (args.length > 1 && args.includes("--letterbox")) {
          letterbox = " letterbox";
        }

        out += '<br/><div class="container ' + orientation + letterbox + '"><iframe src="' + cart + '" frameborder="0"></iframe></div>';
      }
      break;
    case "DEBUG":
      debug = debug ? false : true;
      if (debug) {
        debugWin = window.open("");
        line = 0;
        
        sendDebugInfo("Debug Window Connected.");
        sendDebugInfo("UA: " + window.navigator.userAgent);
        sendDebugInfo("[KEEP THE WINDOW OPEN TO RECEIVE DEBUG INFO]");
        sendDebugInfo("-- DEBUG MESSAGES START HERE --");
      } else {
        debugWin.close();
      }
      out += "<br/>DEBUG MODE IS NOW " + (debug ? "ON" : "OFF") + ".<br/>";
      break;
    case "":
      return;
    default:
      insert("<br/>");
      insert(args[0] + ": COMMAND NOT FOUND.", { unsafe: true });
      out += "<br/>TYPE HELP FOR SUPPORTED COMMANDS.<br/>";
  }

  insert(out + "<br/>");
}

function sendDebugInfo(item, options={prefix:""}) {
  if (debug && debugWin) {
    let out = debugWin.document.createElement("pre");
    out.innerText = "[" + line++ + "]" + options.prefix + JSON.stringify(item);
    debugWin.document.body.appendChild(out);
  }
}

function insert(newNode, options = { echo: false, unsafe: false, newline: true }) {
  let node = document.createElement("div");
  node.classList.add("out")
  if (options.echo) {
    node.classList.add("echo");
  }

  if (options.unsafe) {
    node.innerText = newNode;
  } else {
    node.innerHTML = newNode;
  }

  history.push(node);
  terminal.insertBefore(node, prompt);
}

function clear() {
  while (history.length > 0) {
    history.pop().remove();
  }
}