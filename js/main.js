/* BetterDiscordApp Core JavaScript
 * Version: 1.53
 * Author: Jiiks | http://jiiks.net
 * Date: 27/08/2015 - 16:36
 * Last Update: 02/04/2016
 * https://github.com/Jiiks/BetterDiscordApp
 */
var settingsPanel, emoteModule, utils, quickEmoteMenu, opublicServers, voiceMode, pluginModule, themeModule, customCssEditor;
var jsVersion = 1.6;
var supportedVersion = "0.2.5";

var mainObserver;

var twitchEmoteUrlStart = "https://static-cdn.jtvnw.net/emoticons/v1/";
var twitchEmoteUrlEnd = "/1.0";
var ffzEmoteUrlStart = "https://cdn.frankerfacez.com/emoticon/";
var ffzEmoteUrlEnd = "/1";
var bttvEmoteUrlStart = "https://cdn.betterttv.net/emote/";
var bttvEmoteUrlEnd = "/1x";

var mainCore;

var settings = {
    "Save logs locally":          { "id": "bda-gs-0",  "info": "Saves chat logs locally",                        "implemented": false, "hidden": false},
    "Public Servers":             { "id": "bda-gs-1",  "info": "Display public servers button",                  "implemented": true,  "hidden": false},
    "Minimal Mode":               { "id": "bda-gs-2",  "info": "Hide elements and reduce the size of elements.", "implemented": true,  "hidden": false},
    "Voice Mode":                 { "id": "bda-gs-4",  "info": "Only show voice chat",                           "implemented": true,  "hidden": false},
    "Hide Channels":              { "id": "bda-gs-3",  "info": "Hide channels in minimal mode",                  "implemented": true,  "hidden": false},
    "Quick Emote Menu":           { "id": "bda-es-0",  "info": "Show quick emote menu for adding emotes",        "implemented": true,  "hidden": false},
    "Show Emotes":                { "id": "bda-es-7",  "info": "Show any emotes",                                "implemented": true,  "hidden": false},
    "FrankerFaceZ Emotes":        { "id": "bda-es-1",  "info": "Show FrankerFaceZ Emotes",                       "implemented": true,  "hidden": false},
    "BetterTTV Emotes":           { "id": "bda-es-2",  "info": "Show BetterTTV Emotes",                          "implemented": true,  "hidden": false},
    "Emote Autocomplete":         { "id": "bda-es-3",  "info": "Autocomplete emote commands",                    "implemented": false, "hidden": false},
    "Emote Auto Capitalization":  { "id": "bda-es-4",  "info": "Autocapitalize emote commands",                  "implemented": true,  "hidden": false},
    "Override Default Emotes":    { "id": "bda-es-5",  "info": "Override default emotes",                        "implemented": false, "hidden": false},
    "Show Names":                 { "id": "bda-es-6",  "info": "Show emote names on hover",                      "implemented": true,  "hidden": false},
    "Show emote modifiers":       { "id": "bda-es-8",  "info": "Enable/Disable emote mods",                      "implemented": true,  "hidden": false},
	"Disconnect Voice on exit":   { "id": "bda-dc-0",  "info": "",                								 "implemented": true,  "hidden": false},
    "Custom css live update":     { "id": "bda-css-0", "info": "",                                               "implemented": true,  "hidden": true },
    "Custom css auto udpate":     { "id": "bda-css-1", "info": "",                                               "implemented": true,  "hidden": true }
};

var links = {
    "Jiiks.net": { "text": "Jiiks.net", "href": "http://jiiks.net",          "target": "_blank" },
    "twitter":   { "text": "Twitter",   "href": "http://twitter.com/jiiksi", "target": "_blank" },
    "github":    { "text": "Github",    "href": "http://github.com/jiiks",   "target": "_blank" }
};

var defaultCookie = {
    "version": jsVersion,
    "bda-gs-0": false,
    "bda-gs-1": true,
    "bda-gs-2": false,
    "bda-gs-3": false,
    "bda-gs-4": false,
    "bda-es-0": true,
    "bda-es-1": true,
    "bda-es-2": true,
    "bda-es-3": false,
    "bda-es-4": false,
    "bda-es-5": true,
    "bda-es-6": true,
    "bda-es-7": true,
    "bda-es-8": true,
    "bda-jd": true,
    "bda-es-8": true,
	"bda-dc-0": false,
    "bda-css-0": false,
    "bda-css-1": false
};

var bdchangelog = {
    "changes": {
        "pslist": {
            "title": "v1.60 : New public server list!",
            "text": 'New and shiny public server list powered by <a href="https://www.discordservers.com/" target="_blank">DiscordServers.com</a>!',
            "img": ""
        },
        "api": {
            "title": "v1.59 : New plugin api callback",
            "text": "Use the `observer(e)` callback instead of creating your own MutationObserver",
            "img": ""
        },
        "emotemods": {
            "title": "v1.59 : New emote mods!",
            "text": "The following emote mods have been added: :shake2, :shake3, :flap",
            "img": ""
        },
        "minmode": {
            "title": "v1.59: Minimal mode",
            "text": "Minimal mode embed fixed size has been removed",
            "img": ""
        }
    },
    "fixes": {
        "emotes": {
            "title": "v1.59 : Native sub emote mods",
            "text": "Emote mods now work with native sub emotes!",
            "img": ""
        },
        "emotes2": {
            "title": "v1.59 : Emote mods and custom emotes",
            "text": "Emote mods will no longer interfere with custom emotes using :",
            "img": ""
        }
    }
};

var settingsCookie = {};

function Core() {}

Core.prototype.init = function () {
    var self = this;

    if (version < supportedVersion) {
        this.alert("Not Supported", "BetterDiscord v" + version + "(your version)" + " is not supported by the latest js(" + jsVersion + ").<br><br> Please download the latest version from <a href='https://betterdiscord.net' target='_blank'>BetterDiscord.net</a>");
        return;
    }

    utils = new Utils();
    var sock = new BdWSocket();
    sock.start();
    utils.getHash();
    emoteModule = new EmoteModule();
    quickEmoteMenu = new QuickEmoteMenu();
    voiceMode = new VoiceMode();

    emoteModule.init();

    this.initSettings();
    this.initObserver();

    //Incase were too fast
    function gwDefer() {
        console.log(new Date().getTime() + " Defer");
        if ($(".guilds-wrapper .guilds").children().length > 0) {
            console.log(new Date().getTime() + " Defer Loaded");
            var guilds = $(".guilds>li:first-child");

            var showChannelsButton = $("<button/>", {
                class: "btn",
                id: "bd-show-channels",
                text: "R",
                css: {
                    "cursor": "pointer"
                },
                click: function () {
                    settingsCookie["bda-gs-3"] = false;
                    $("body").removeClass("bd-minimal-chan");
                    self.saveSettings();
                }
            });

            $(".guilds-wrapper").prepend(showChannelsButton);

            opublicServers = new PublicServers();
            customCssEditor = new CustomCssEditor();
            pluginModule = new PluginModule();
            pluginModule.loadPlugins();
            if (typeof (themesupport2) !== "undefined") {
                themeModule = new ThemeModule();
                themeModule.loadThemes();
            }

            settingsPanel = new SettingsPanel();
            settingsPanel.init();

            quickEmoteMenu.init(false);

            $("#tc-settings-button").on("click", function () {
                settingsPanel.show();
            });
            
			window.addEventListener("beforeunload", function(){
				if(settingsCookie["bda-dc-0"]){
					$('.btn.btn-disconnect').click();
				}
			});
			
            opublicServers.init();

            emoteModule.autoCapitalize();

            /*Display new features in BetterDiscord*/
            if (settingsCookie["version"] < jsVersion) {
                var cl = self.constructChangelog();
                $("body").append(cl);
                settingsCookie["version"] = jsVersion;
                self.saveSettings();
            }

            $("head").append("<style>.CodeMirror{ min-width:100%; }</style>");
            $("head").append('<style id="bdemotemenustyle"></style>');

        } else {
            setTimeout(gwDefer, 100);
        }
    }


    $(document).ready(function () {
        setTimeout(gwDefer, 1000);
    });
};

Core.prototype.initSettings = function () {
    if ($.cookie("better-discord") == undefined) {
        settingsCookie = defaultCookie;
        this.saveSettings();
    } else {
        this.loadSettings();

        for (var setting in defaultCookie) {
            if (settingsCookie[setting] == undefined) {
                settingsCookie[setting] = defaultCookie[setting];
                this.saveSettings();
            }
        }
    }
};

Core.prototype.saveSettings = function () {
    $.cookie("better-discord", JSON.stringify(settingsCookie), {
        expires: 365,
        path: '/'
    });
};

Core.prototype.loadSettings = function () {
    settingsCookie = JSON.parse($.cookie("better-discord"));
};
var botlist = ["119598467310944259"]; //Temp
Core.prototype.initObserver = function () {
    mainObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (typeof pluginModule !== "undefined") pluginModule.rawObserver(mutation);
            if (mutation.target.getAttribute('class') != null) {
                //console.log(mutation.target)
                if(mutation.target.classList.contains('title-wrap') || mutation.target.classList.contains('chat')){
                    quickEmoteMenu.obsCallback();
                    voiceMode.obsCallback();
                    if (typeof pluginModule !== "undefined") pluginModule.channelSwitch();
                }
                if (mutation.target.getAttribute('class').indexOf('scroller messages') != -1) {
                    if (typeof pluginModule !== "undefined") pluginModule.newMessage();
                }
            }
            emoteModule.obsCallback(mutation);
        });
    });

    //noinspection JSCheckFunctionSignatures
    mainObserver.observe(document, {
        childList: true,
        subtree: true
    });
};

Core.prototype.constructChangelog = function () {
    var changeLog = '' +
        '<div id="bd-wn-modal" class="modal" style="opacity:1;">' +
        '  <div class="modal-inner">' +
        '       <div id="bdcl" class="change-log"> ' +
        '           <div class="header">' +
        '               <strong>What\'s new in BetterDiscord JS' + jsVersion + '</strong>' +
        '               <button class="close" onclick=\'$("#bd-wn-modal").remove();\'></button>' +
        '           </div><!--header-->' +
        '           <div class="scroller-wrap">' +
        '               <div class="scroller">';

    if (bdchangelog.changes != null) {
        changeLog += '' +
            '<h1 class="changelog-added">' +
            '   <span>New Stuff</span>' +
            '</h1>' +
            '<ul>';

        for (var change in bdchangelog.changes) {
            change = bdchangelog.changes[change];

            changeLog += '' +
                '<li>' +
                '   <strong>' + change.title + '</strong>' +
                '   <div>' + change.text + '</div>' +
                '</li>';
        }

        changeLog += '</ul>';
    }

    if (bdchangelog.fixes != null) {
        changeLog += '' +
            '<h1 class="changelog-fixed">' +
            '   <span>Fixed</span>' +
            '</h1>' +
            '<ul>';

        for (var fix in bdchangelog.fixes) {
            fix = bdchangelog.fixes[fix];

            changeLog += '' +
                '<li>' +
                '   <strong>' + fix.title + '</strong>' +
                '   <div>' + fix.text + '</div>' +
                '</li>';
        }

        changeLog += '</ul>';
    }

    if (bdchangelog.upcoming != null) {
        changeLog += '' +
            '<h1 class="changelog-in-progress">' +
            '   <span>Coming Soon</span>' +
            '</h1>' +
            '<ul>';

        for (var upc in bdchangelog.upcoming) {
            upc = bdchangelog.upcoming[upc];

            changeLog += '' +
                '<li>' +
                '   <strong>' + upc.title + '</strong>' +
                '   <div>' + upc.text + '</div>' +
                '</li>';
        }

        changeLog += '</ul>';
    }

    changeLog += '' +
        '               </div><!--scoller-->' +
        '           </div><!--scroller-wrap-->' +
        '           <div class="footer">' +
        '           </div><!--footer-->' +
        '       </div><!--change-log-->' +
        '   </div><!--modal-inner-->' +
        '</div><!--modal-->';

    return changeLog;
};

Core.prototype.alert = function (title, text) {
    $("body").append('' +
        '<div class="bd-alert">' +
        '   <div class="bd-alert-header">' +
        '       <span>' + title + '</span>' +
        '       <div class="bd-alert-closebtn" onclick="$(this).parent().parent().remove();">×</div>' +
        '   </div>' +
        '   <div class="bd-alert-body">' +
        '       <div class="scroller-wrap dark fade">' +
        '           <div class="scroller">' + text + '</div>' +
        '       </div>' +
        '   </div>' +
        '</div>');
};

/* BetterDiscordApp EmoteModule JavaScript
 * Version: 1.5
 * Author: Jiiks | http://jiiks.net
 * Date: 26/08/2015 - 15:29
 * Last Update: 14/10/2015 - 09:48
 * https://github.com/Jiiks/BetterDiscordApp
 * Note: Due to conflicts autocapitalize only supports global emotes
 */

/*
 * =Changelog=
 * -v1.5
 * --Twitchemotes.com api
 */

var emotesFfz = {};
var emotesBTTV = {};
var emotesTwitch = {
    "emotes": {
        "emote": {
            "image_id": 0
        }
    }
}; //for ide
var subEmotesTwitch = {};

function EmoteModule() {}

EmoteModule.prototype.init = function () {};

EmoteModule.prototype.getBlacklist = function () {
    $.getJSON("https://cdn.rawgit.com/Jiiks/betterDiscordApp/" + _hash + "/data/emotefilter.json", function (data) {
        bemotes = data.blacklist;
    });
};

EmoteModule.prototype.obsCallback = function (mutation) {
    var self = this;

    if (!settingsCookie["bda-es-7"]) return;

    $(".emoji").each(function () {
        var t = $(this);
        if (t.attr("src").indexOf(".png") != -1) {

            var next = t.next();
            var newText = t.attr("alt");
            if(next.size() > 0) {
                if(next.prop("tagName") == "SPAN") {
                    newText += next.text();
                    next.remove();
                }
            }

            if(t.parent().prop("tagName") != "SPAN") {
                t.replaceWith("<span>" + newText + "</span>");
            } else {
                t.replaceWith(newText);
            }
        }
    });

    for (var i = 0; i < mutation.addedNodes.length; ++i) {
        var next = mutation.addedNodes.item(i);
        if (next) {
            var nodes = self.getNodes(next);
            for (var node in nodes) {
                if (nodes.hasOwnProperty(node)) {
                    self.injectEmote(nodes[node]);
                }
            }
        }
    }
};

EmoteModule.prototype.getNodes = function (node) {
    var next;
    var nodes = [];

    var treeWalker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);

    while (next = treeWalker.nextNode()) {
        nodes.push(next);
    }


    return nodes;
};

var bemotes = [];
var spoilered = [];

EmoteModule.prototype.injectEmote = function (node) {

    if (typeof emotesTwitch === 'undefined') return;

    if (!node.parentElement) return;

    var parent = node.parentElement;

    if (parent.tagName != "SPAN") return;
    if (!$(parent.parentElement).hasClass("markup") && !$(parent.parentElement).hasClass("message-content")) {
        return;
    }

    var edited = false;

    if ($(parent.parentElement).hasClass("edited")) {
        parent = parent.parentElement.parentElement.firstChild;
        edited = true;
    }

    function inject() {
        var parentInnerHTML = parent.innerHTML;
        var words = parentInnerHTML.split(/\s+/g);

        if (!words) return;

        words.some(function (word) {
            if (word.slice(0, 4) == "[!s]") {

                parentInnerHTML = parentInnerHTML.replace("[!s]", "");
                var markup = $(parent).parent();
                var reactId = markup.attr("data-reactid");

                if (spoilered.indexOf(reactId) > -1) {
                    return;
                }

                markup.addClass("spoiler");
                markup.on("click", function () {
                    $(this).removeClass("spoiler");
                    spoilered.push($(this).attr("data-reactid"));
                });

                return;
            }

            if (word.length < 4) {
                return;
            }

            if (word == "ClauZ") {
                parentInnerHTML = parentInnerHTML.replace("ClauZ", '<img src="https://cdn.frankerfacez.com/emoticon/70852/1" style="width:25px; transform:translate(-29px, -14px);"></img>');
                return;
            }

            var useEmoteCss = false;
            var sWord = word;
            var emoteClass = "";
            var allowedClasses = ["emoteflip", "emotespin", "emotepulse", "emotespin2", "emotespin3", "emote1spin", "emote2spin", "emote3spin", "emotetr", "emotebl", "emotebr", "emoteshake", "emoteshake2", "emoteshake3", "emoteflap"];
            if(word.indexOf(":") > -1) {
              // userEmoteCss = true;
                //sWord = word.split(":")[0];
                var split = word.split(/:(?!.*:)/);
                if (split[0] != "" && split[1] != "") { 
                    userEmoteCss = true;
                    sWord = split[0];
                    if(settingsCookie["bda-es-8"]) {
                   // emoteClass = "emote" + word.split(":")[1];
                        emoteClass = "emote" + split[1];
                        if(allowedClasses.indexOf(emoteClass) < 0) {
                            emoteClass = "";
                        }
                    }
                }
            }
            if ($.inArray(sWord, bemotes) != -1) return;

            if (emotesTwitch.emotes.hasOwnProperty(sWord)) {
                var len = Math.round(sWord.length / 4);
                var name = sWord.substr(0, len) + "\uFDD9" + sWord.substr(len, len) + "\uFDD9" + sWord.substr(len * 2, len) + "\uFDD9" + sWord.substr(len * 3);
                var url = twitchEmoteUrlStart + emotesTwitch.emotes[sWord].image_id + twitchEmoteUrlEnd;
                parentInnerHTML = parentInnerHTML.replace(word, '<div class="emotewrapper"><img class="emote '+emoteClass+'" alt="' + name + '" src="' + url + '"/><input onclick=\'quickEmoteMenu.favorite(\"' + name + '\", \"' + url + '\");\' class="fav" title="Favorite!" type="button"></div>');
                return;
            }

            if (subEmotesTwitch.hasOwnProperty(sWord)) {
                var len = Math.round(sWord.length / 4);
                var name = sWord.substr(0, len) + "\uFDD9" + sWord.substr(len, len) + "\uFDD9" + sWord.substr(len * 2, len) + "\uFDD9" + sWord.substr(len * 3);
                var url = twitchEmoteUrlStart + subEmotesTwitch[sWord] + twitchEmoteUrlEnd;
                parentInnerHTML = parentInnerHTML.replace(word, '<div class="emotewrapper"><img class="emote '+emoteClass+'" alt="' + name + '" src="' + url + '"/><input onclick=\'quickEmoteMenu.favorite(\"' + name + '\", \"' + url + '\");\' class="fav" title="Favorite!" type="button"></div>');
                return;
            }
            
            if (typeof emotesFfz !== 'undefined' && settingsCookie["bda-es-1"]) {
                if (emotesFfz.hasOwnProperty(sWord)) {
                    var len = Math.round(sWord.length / 4);
                    var name = sWord.substr(0, len) + "\uFDD9" + sWord.substr(len, len) + "\uFDD9" + sWord.substr(len * 2, len) + "\uFDD9" + sWord.substr(len * 3);
                    var url = ffzEmoteUrlStart + emotesFfz[sWord] + ffzEmoteUrlEnd;
                    parentInnerHTML = parentInnerHTML.replace(word, '<div class="emotewrapper"><img class="emote '+emoteClass+'" alt="' + name + '" src="' + url + '"/><input onclick=\'quickEmoteMenu.favorite(\"' + name + '\", \"' + url + '\");\' class="fav" title="Favorite!" type="button"></div>');
                    return;
                }
            }

            if (typeof emotesBTTV !== 'undefined' && settingsCookie["bda-es-2"]) {
                if (emotesBTTV.hasOwnProperty(sWord)) {
                    var len = Math.round(sWord.length / 4);
                    var name = sWord.substr(0, len) + "\uFDD9" + sWord.substr(len, len) + "\uFDD9" + sWord.substr(len * 2, len) + "\uFDD9" + sWord.substr(len * 3);
                    var url = emotesBTTV[sWord];
                    parentInnerHTML = parentInnerHTML.replace(word, '<div class="emotewrapper"><img class="emote '+emoteClass+'" alt="' + name + '" src="' + url + '"/><input onclick=\'quickEmoteMenu.favorite(\"' + name + '\", \"' + url + '\");\' class="fav" title="Favorite!" type="button"></div>');
                    return;
                }
            }

            if (typeof emotesBTTV2 !== 'undefined' && settingsCookie["bda-es-2"]) {
                if (emotesBTTV2.hasOwnProperty(sWord)) {
                    var len = Math.round(sWord.length / 4);
                    var name = sWord.substr(0, len) + "\uFDD9" + sWord.substr(len, len) + "\uFDD9" + sWord.substr(len * 2, len) + "\uFDD9" + sWord.substr(len * 3);
                    var url = bttvEmoteUrlStart + emotesBTTV2[sWord] + bttvEmoteUrlEnd;
                    parentInnerHTML = parentInnerHTML.replace(word, '<div class="emotewrapper"><img class="emote '+emoteClass+'" alt="' + name + '" src="' + url + '"/><input onclick=\'quickEmoteMenu.favorite(\"' + name + '\", \"' + url + '\");\' class="fav" title="Favorite!" type="button"></div>');
                    return;
                }
            }

        });

        if (parent.parentElement == null) return;

        var oldHeight = parent.parentElement.offsetHeight;
        parent.innerHTML = parentInnerHTML.replace(new RegExp("\uFDD9", "g"), "");
        var newHeight = parent.parentElement.offsetHeight;

        var scrollPane = $(".scroller.messages").first();
        scrollPane.scrollTop(scrollPane.scrollTop() + (newHeight - oldHeight));
        
    }

    if (edited) {
        setTimeout(inject, 250);
    } else {
        inject();
    }

};

EmoteModule.prototype.autoCapitalize = function () {

    var self = this;

    $('body').delegate($(".channel-textarea-inner textarea"), 'keyup change paste', function () {
        if (!settingsCookie["bda-es-4"]) return;

        var text = $(".channel-textarea-inner textarea").val();

        if (text == undefined) return;

        var lastWord = text.split(" ").pop();
        if (lastWord.length > 3) {
            if (lastWord == "danSgame") return;
            var ret = self.capitalize(lastWord.toLowerCase());
            if (ret !== null && ret !== undefined) {
                $(".channel-textarea-inner textarea").val(text.replace(lastWord, ret));
            }
        }
    });
};

EmoteModule.prototype.capitalize = function (value) {
    var res = emotesTwitch.emotes;
    for (var p in res) {
        if (res.hasOwnProperty(p) && value == (p + '').toLowerCase()) {
            return p;
        }
    }
};

/* BetterDiscordApp PublicSevers JavaScripts
 * Version: 1.0
 * Author: Jiiks | http://jiiks.net
 * Date: 27/08/2015 - 14:16
 * https://github.com/Jiiks/BetterDiscordApp
 */

function PublicServers() {

}

PublicServers.prototype.getPanel = function () {
    return this.container;
};

PublicServers.prototype.init = function () {
    var self = this;

    var guilds = $(".guilds>li:first-child");

    guilds.after($("<li></li>", {
        id: "bd-pub-li",
        css: {
            "height": "20px",
            "display": settingsCookie["bda-gs-1"] == true ? "" : "none"
        }
    }).append($("<div/>", {
        class: "guild-inner",
        css: {
            "height": "20px",
            "border-radius": "4px"
        }
    }).append($("<a/>").append($("<div/>", {
        css: {
            "line-height": "20px",
            "font-size": "12px"
        },
        text: "public",
        id: "bd-pub-button"
    })))));

    $("#bd-pub-button").on("click", function () {
        self.show();
    });

    var panelBase="";
        panelBase += "<div id=\"pubs-container\">";
        panelBase += "  <div id=\"pubs-spinner\">";
        panelBase += "    <span class=\"spinner\" type=\"wandering-cubes\"><span class=\"spinner-inner spinner-wandering-cubes\"><span class=\"spinner-item\"><\/span><span class=\"spinner-item\"><\/span><\/span><\/span>";
        panelBase += "  <\/div>";
        panelBase += "  <div id=\"pubs-header\">";
        panelBase += "    <h2 id=\"pubs-header-title\">Public Servers<\/h2>";
        panelBase += "    <button id=\"sbtn\">Search<\/button>";
        panelBase += "    <input id=\"sterm\" type=\"text\" placeholder=\"Search term...\"\/>";
        panelBase += "  <\/div>";
        panelBase += "  <div class=\"scroller-wrap\">";
        panelBase += "    <div class=\"scroller\">";
        panelBase += "      <div id=\"slist\" class=\"servers-listing\">";
        panelBase += "        ";
        panelBase += "      <\/div>";
        panelBase += "    <\/div>";
        panelBase += "  <\/div>";
        panelBase += "  <div id=\"pubs-footer\">";
        panelBase += "    <div>Server list provided by <a href=\"https:\/\/www.discordservers.com\/\" target=\"_blank\">DiscordServers.com<\/a><\/div>";
        panelBase += "  <\/div>";
        panelBase += "<\/div>";
    this.container = panelBase;

    if($("#bd-pub-li").length < 1) {
        setTimeout(function() {
            self.init();
        }, 250);
    }
};


PublicServers.prototype.show = function () {
    var self = this;
    $("body").append(this.getPanel());

    var dataset = {
        "sort": [{
            "online": "desc"
        }],
        "from": 0,
        "size": 20,
        "query": {
            "filtered": {
                "query": {
                    "match_all": {}
                }
            }
        }
    };

    $("#sbtn").on("click", function() {
        self.search();
    });
    $("#sterm").on("keyup", function(e) {
        if (e.keyCode == 13) {
            self.search();
        }
    });


   this.loadServers(dataset, false);
   var self = this;
    $(document).on("mouseup.bdps",function(e) {
        if(!$("#bd-pub-button").is(e.target) && !$("#pubs-container").is(e.target) && $("#pubs-container").has(e.target).length === 0) {
            self.hide();
        }
    });
};

PublicServers.prototype.hide = function() {
    $("#pubs-container").remove();
    $(document).off("mouseup.bdps");
};

PublicServers.prototype.loadServers = function(dataset, search) {
    var self = this;
    $("#sbtn").prop("disabled", true);
    $("#sterm").prop("disabled", true);
    $("#slist").empty();
    $("#pubs-spinner").show();
    $.ajax({
        type: "POST",
        dataType: "json",
        url: "https://search-discordservers-izrtub5nprzrl76ugyy6hdooe4.us-west-1.es.amazonaws.com/app/_search",
        crossDomain: true,
        data: JSON.stringify(dataset),
        success: function(data) {
            var hits = data.hits.hits;
            if(search) {
              $("#pubs-header-title").text("Public Servers - Search Results: " + hits.length);
            } else {
              $("#pubs-header-title").text("Public Servers");
            }
            hits.forEach(function(hit) {
                var source = hit._source;
                var icode = source.invite_code;
                var html = '<div class="server-row">';
                html += '<div class="server-icon" style="background-image:url(' + source.icon + ')"></div>';
                html += '<div class="server-info server-name">';
                html += '<span>' + source.name + ' by ' + source.owner.name + '</span>';
                html += '</div>';
                html += '<div class="server-info server-members">';
                html += '<span>' + source.online + '/' + source.members + ' Members</span>';
                html += '</div>';
                html += '<div class="server-info server-region">';
                html += '<span>' + source.region + '</span>';
                html += '</div>';
                html += '<div class="server-info">';
                html += '<button data-server-invite-code='+icode+'>Join</button>';
                html += '</div>';
                html += '</div>';
                $("#slist").append(html);
                $("button[data-server-invite-code="+icode+"]").on("click", function(){
                    self.joinServer(icode);
                });
            });
        },
      done: function() {
        $("#pubs-spinner").hide();
        $("#sbtn").prop("disabled", false);
        $("#sterm").prop("disabled", false);
      },
      always: function() {
        $("#pubs-spinner").hide();
        $("#sbtn").prop("disabled", false);
        $("#sterm").prop("disabled", false);
      },
      error: function() {
        $("#pubs-spinner").hide();
        $("#sbtn").prop("disabled", false);
        $("#sterm").prop("disabled", false);
      },
      complete: function() {
        $("#pubs-spinner").hide();
        $("#sbtn").prop("disabled", false);
        $("#sterm").prop("disabled", false);
      }
    });
};

PublicServers.prototype.search = function() {
    var dataset = {
        "sort": [{
            "online": "desc"
        }],
        "from": 0,
        "size": 20,
        "query": {
            "filtered": {
                "query": {
                    "match_all": {}
                }
            }
        }
    };

    var filter = {
        "filter": {
            "and": [{
                "query": {
                    "match_phrase_prefix": {
                        "name": $("#sterm").val()
                    }
                }
            }]
        }
    };

    if ($("#sterm").val()) {
        $.extend(dataset, filter);
    }
    this.loadServers(dataset, true);
};

//Workaround for joining a server
PublicServers.prototype.joinServer = function (code) {
    $(".guilds-add").click();
    $(".action.join .btn").click();
    $(".create-guild-container input").val(code);
    $(".form.join-server .btn-primary").click();
};

/* BetterDiscordApp QuickEmoteMenu JavaScript
 * Version: 1.3
 * Author: Jiiks | http://jiiks.net
 * Date: 26/08/2015 - 11:49
 * Last Update: 29/08/2015 - 11:46
 * https://github.com/Jiiks/BetterDiscordApp
 */

var emoteBtn, emoteMenu;
var eiarr = [1, 3, 4, 6, 7, 8, 10, 11, 12, 13, 14];

function QuickEmoteMenu() {

}

QuickEmoteMenu.prototype.init = function (reload) {

    emoteBtn = null;
    $(".channel-textarea").first().removeClass("emotemenu-enabled");
    if (!emoteMenu) {
        this.initEmoteList();
    }

    var menuOpen;

    emoteBtn = $("<div/>", {
        id: "twitchcord-button-container",
        style: "display:none"
    }).append($("<button/>", {
        id: "twitchcord-button",
        onclick: "return false;"
    }));

    $(".content.flex-spacer.flex-horizontal .flex-spacer.flex-vertical form").append(emoteBtn);

    emoteMenu.detach();
    emoteBtn.append(emoteMenu);

    $("#twitchcord-button").on("click", function () {
        menuOpen = !menuOpen;
        if (menuOpen) {
            $("#bdemotemenustyle").html('.twitchcord-button-open { background-image:url(https://static-cdn.jtvnw.net/emoticons/v1/' + eiarr[Math.floor(Math.random() * eiarr.length)] + '/1.0) !important; }');
            emoteMenu.addClass("emotemenu-open");
            $(this).addClass("twitchcord-button-open");
        } else {
            emoteMenu.removeClass();
            $(this).removeClass();
        }
        return false;
    });

    $(document).off("click.bdem").on("click.bdem", function () {
        if (menuOpen) {
            menuOpen = !menuOpen;
            emoteMenu.removeClass();
            $("#twitchcord-button").removeClass();
        }
    });

    $("#emote-menu").on("click", function () {
        $("#rmenu").hide();
        return false;
    });

    if (settingsCookie["bda-es-0"]) {
        $(".channel-textarea").first().addClass("emotemenu-enabled");
        emoteBtn.show();
    }

    var emoteIcon = $(".emote-icon");

    emoteIcon.off();
    emoteIcon.on("click", function () {
        var emote = $(this).attr("title");
        var ta = $(".channel-textarea-inner textarea");
        ta.val(ta.val().slice(-1) == " " ? ta.val() + emote : ta.val() + " " + emote);
    });

    var fe = localStorage["bdfavemotes"];
    if (fe != undefined) {
        favoriteEmotes = JSON.parse(atob(fe));
        this.updateFavorites();
    }
};

var bdfw = {};

QuickEmoteMenu.prototype.obsCallback = function () {
    if (!emoteBtn) return;
    if (!$(".content.flex-spacer.flex-horizontal .flex-spacer.flex-vertical form")) return;

    var tcbtn = $("#twitchcord-button-container");
    if (tcbtn.parent().prop("tagName") == undefined) {
        quickEmoteMenu = new QuickEmoteMenu();
        quickEmoteMenu.init(true);
    }
};

var favoriteEmotes = {};

QuickEmoteMenu.prototype.initEmoteList = function () {

    emoteMenu = $("<div/>", {
        id: "emote-menu"
    });

    var emoteMenuHeader = $("<div/>", {
        id: "emote-menu-header"
    });
    var emoteMenuBody = $("<div/>", {
        id: "emote-menu-inner"
    });
    var emoteMenuBodyFav = $("<div/>", {
        id: "emote-menu-inner-fav",
        css: {
            "display": "none"
        }
    });

    var globalTab = $("<div/>", {
        class: "emote-menu-tab emote-menu-tab-selected",
        id: "emgb",
        text: "Global",
        click: function () {
            $("#emfa").removeClass("emote-menu-tab-selected");
            $("#emgb").addClass("emote-menu-tab-selected");
            $("#emote-menu-inner-fav").hide();
            $("#emote-menu-inner").show();
        }
    });
    var favoriteTab = $("<div/>", {
        class: "emote-menu-tab",
        id: "emfa",
        text: "Favorite",
        click: function () {
            $("#emgb").removeClass("emote-menu-tab-selected");
            $("#emfa").addClass("emote-menu-tab-selected");
            $("#emote-menu-inner").hide();
            $("#emote-menu-inner-fav").show();
        }
    });

    emoteMenuHeader.append(globalTab);
    emoteMenuHeader.append(favoriteTab);

    emoteMenu.append(emoteMenuHeader);

    var swrapper = $("<div/>", {
        class: "scroller-wrap"
    });
    var scroller = $("<div/>", {
        class: "scroller"
    });


    swrapper.append(scroller);
    scroller.append(emoteMenuBody);
    scroller.append(emoteMenuBodyFav);

    emoteMenu.append(swrapper);

    for (var emote in emotesTwitch.emotes) {
        if (emotesTwitch.emotes.hasOwnProperty(emote)) {
            var id = emotesTwitch.emotes[emote].image_id;
            emoteMenuBody.append($("<div/>", {
                class: "emote-container"
            }).append($("<img/>", {
                class: "emote-icon",
                id: emote,
                alt: "",
                src: "https://static-cdn.jtvnw.net/emoticons/v1/" + id + "/1.0",
                title: emote
            })));
        }
    }
};

QuickEmoteMenu.prototype.favorite = function (name, url) {

    if (!favoriteEmotes.hasOwnProperty(name)) {
        favoriteEmotes[name] = url;
    }

    this.updateFavorites();
};

QuickEmoteMenu.prototype.updateFavorites = function () {

    if (!$("#rmenu").length) {
        $("body").append('<div id="rmenu"><ul><a href="#">Remove</a></ul></div>');
        $(document).on("click", function () {
            $("#rmenu").hide();
        });
    }

    $("#rmenu").on("click", function(e) { $(this).hide(); return false; });

    var self = this;
    var emoteMenuBody = $("#emote-menu-inner-fav");
    emoteMenuBody.empty();
    for (var emote in favoriteEmotes) {
        var url = favoriteEmotes[emote];

        var econtainer = $("<div/>", {
            class: "emote-container"
        });
        var icon = $("<img/>", {
            class: "emote-icon",
            alt: "",
            src: url,
            title: emote
        }).appendTo(econtainer);
        emoteMenuBody.append(econtainer);

        icon.off("click").on("click", function (e) {
            var emote = $(this).attr("title");
            var ta = $(".channel-textarea-inner textarea");
            ta.val(ta.val().slice(-1) == " " ? ta.val() + emote : ta.val() + " " + emote);
        });
        icon.off("contextmenu").on("contextmenu", function (e) {
            var title = $(this).attr("title");
            var menu = $("#rmenu");
            menu.find("a").off("click").on("click", function () {
                delete favoriteEmotes[title];
                self.updateFavorites();
            });
            menu.hide();
            menu.css({
                top: e.pageY,
                left: e.pageX
            });
            menu.show();
            return false;
        });
    }

    window.localStorage["bdfavemotes"] = btoa(JSON.stringify(favoriteEmotes));
};


function CustomCssEditor() { }

CustomCssEditor.prototype.init = function() {
var self = this;
self.editor = CodeMirror.fromTextArea(document.getElementById("bd-custom-css-ta"), {
    lineNumbers: true,
    mode: 'css',
    indentUnit: 4,
    theme: 'neat'
});

self.editor.on("change", function (cm) {
    var css = cm.getValue();
    self.applyCustomCss(css, false, false);
});

var detachEditor="";
    detachEditor += "<div id=\"bd-customcss-detach-container\">";
    detachEditor += "   <div id=\"bd-customcss-detach-editor\">";
    detachEditor += "";
    detachEditor += "   <\/div>";
    detachEditor += "   <div id=\"bd-customcss-detach-controls\">";
    detachEditor += "       <ul class=\"checkbox-group\">";
    detachEditor += "       <li>";
    detachEditor += "           <div class=\"checkbox\">";
    detachEditor += "               <div class=\"checkbox-inner\"><input type=\"checkbox\" checked=\"\"><span><\/span><\/div>";
    detachEditor += "               <span title=\"Update client css while typing\">Live Update<\/span>";
    detachEditor += "           <\/div>";
    detachEditor += "       <\/li>";
    detachEditor += "       <li>";
    detachEditor += "           <div class=\"checkbox\">";
    detachEditor += "               <div class=\"checkbox-inner\"><input type=\"checkbox\"><span><\/span><\/div>";
    detachEditor += "               <span title=\"Autosave css to localstorage when typing\">Autosave<\/span>";
    detachEditor += "           <\/div>";
    detachEditor += "       <\/li>";
    detachEditor += "        <li>";
    detachEditor += "           <div class=\"checkbox\">";
    detachEditor += "               <div class=\"checkbox-inner\"><input type=\"checkbox\"><span><\/span><\/div>";
    detachEditor += "               <span title=\"Hide the callout backdrop to disable modal close events\">Hide Backdrop<\/span>";
    detachEditor += "           <\/div>";
    detachEditor += "       <\/li>";
    detachEditor += "   <\/ul>";
    detachEditor += "";
    detachEditor += "   <div id=\"bd-customcss-detach-controls-buttons\">";
    detachEditor += "       <button id=\"bd-customcss-detached-update\">Update<\/button>";
    detachEditor += "       <button id=\"bd-customcss-detached-save\">Save<\/button>";
    detachEditor += "   <\/div>";
    detachEditor += "   <\/div>";
    detachEditor += "<\/div>";
this.detachedEditor = detachEditor;
};

CustomCssEditor.prototype.attach = function() {
	$("#editor-detached").hide();
	$("#app-mount").removeClass("bd-detached-editor");
	$("#bd-customcss-pane").append($("#bd-customcss-innerpane"));
    $("#bd-customcss-detach-container").remove();
};

CustomCssEditor.prototype.detach = function() {
	var self = this;
    this.attach();
    $("#editor-detached").show();
    $("#app-mount").addClass("bd-detached-editor");
    $(".app").parent().append(this.detachedEditor);
    $("#bd-customcss-detach-editor").append($("#bd-customcss-innerpane"));
    $("#bd-customcss-detached-update").on("click", function() {
    		self.applyCustomCss(self.editor.getValue(), true, false);
    });
    $("#bd-customcss-detached-save").on("click", function() {
    		self.applyCustomCss(self.editor.getValue(), false, true);
    });
};

CustomCssEditor.prototype.applyCustomCss = function (css, forceupdate, forcesave) {
    if ($("#customcss").length == 0) {
        $("head").append('<style id="customcss"></style>');
    }

    if(forceupdate || settingsCookie["bda-css-0"]) {
        $("#customcss").html(css);
    }

    if(forcesave || settingsCookie["bda-css-1"]) {
        localStorage.setItem("bdcustomcss", btoa(css));
    }
};


/* BetterDiscordApp Settings Panel JavaScript
 * Version: 2.0
 * Author: Jiiks | http://jiiks.net
 * Date: 26/08/2015 - 11:54
 * Last Update: 27/11/2015 - 00:50
 * https://github.com/Jiiks/BetterDiscordApp
 */

var settingsButton = null;
var panel = null;

function SettingsPanel() {
    utils.injectJs("https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.9.0/codemirror.min.js");
    utils.injectJs("https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.9.0/mode/css/css.min.js");
    utils.injectJs("https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.4.2/Sortable.min.js");
}

SettingsPanel.prototype.init = function () {
    var self = this;
    self.construct();
    var body = $("body");

    if (settingsCookie["bda-es-0"]) {
        $("#twitchcord-button-container").show();
    } else {
        $("#twitchcord-button-container").hide();
    }

    if (settingsCookie["bda-gs-2"]) {
        body.addClass("bd-minimal");
    } else {
        body.removeClass("bd-minimal");
    }
    if (settingsCookie["bda-gs-3"]) {
        body.addClass("bd-minimal-chan");
    } else {
        body.removeClass("bd-minimal-chan");
    }

    if (settingsCookie["bda-gs-4"]) {
        voiceMode.enable();
    }

    if (settingsCookie["bda-es-6"]) {
        //Pretty emote titles
        emoteNamePopup = $("<div class='tipsy tipsy-se' style='display: block; top: 82px; left: 1630.5px; visibility: visible; opacity: 0.8;'><div class='tipsy-inner'></div></div>");
        $(document).on("mouseover", ".emote", function () {
            var x = $(this).offset();
            var title = $(this).attr("alt");
            $(emoteNamePopup).find(".tipsy-inner").text(title);
            $(emoteNamePopup).css('left', x.left - 25);
            $(emoteNamePopup).css('top', x.top - 32);
            $("div[data-reactid='.0.1.1']").append($(emoteNamePopup));
        });
        $(document).on("mouseleave", ".emote", function () {
            $(".tipsy").remove();
        });
    } else {
        $(document).off('mouseover', '.emote');
    }
};

var customCssInitialized = false;
var lastTab = "";

SettingsPanel.prototype.changeTab = function (tab) {

    var self = this;

    lastTab = tab;

    var controlGroups = $("#bd-control-groups");
    $(".bd-tab").removeClass("selected");
    $(".bd-pane").hide();
    $("#" + tab).addClass("selected");
    $("#" + tab.replace("tab", "pane")).show();

    switch (tab) {
    case "bd-settings-tab":
        break;
    case "bd-customcss-tab":
        if (!customCssInitialized) {
         	customCssEditor.init();
            customCssInitialized = true;
        }
        break;
    case "bd-plugins-tab":

        break;
    case "bd-themes-tab":
        controlGroups.html("<span>Coming soon</span>");
        break;
    }
};

SettingsPanel.prototype.updateSetting = function (checkbox) {
    var cb = $(checkbox).children().find('input[type="checkbox"]');
    var enabled = !cb.is(":checked");
    var id = cb.attr("id");
    cb.prop("checked", enabled);

    settingsCookie[id] = enabled;

    if (settingsCookie["bda-es-0"]) {
        $("#twitchcord-button-container").show();
    } else {
        $("#twitchcord-button-container").hide();
    }

    if (settingsCookie["bda-gs-2"]) {
        $("body").addClass("bd-minimal");
    } else {
        $("body").removeClass("bd-minimal");
    }
    if (settingsCookie["bda-gs-3"]) {
        $("body").addClass("bd-minimal-chan");
    } else {
        $("body").removeClass("bd-minimal-chan");
    }
    if (settingsCookie["bda-gs-1"]) {
        $("#bd-pub-li").show();
    } else {
        $("#bd-pub-li").hide();
    }
    if (settingsCookie["bda-gs-4"]) {
        voiceMode.enable();
    } else {
        voiceMode.disable();
    }
    if (settingsCookie["bda-es-6"]) {
        //Pretty emote titles
        emoteNamePopup = $("<div class='tipsy tipsy-se' style='display: block; top: 82px; left: 1630.5px; visibility: visible; opacity: 0.8;'><div class='tipsy-inner'></div></div>");
        $(document).on("mouseover", ".emote", function () {
            var x = $(this).offset();
            var title = $(this).attr("alt");
            $(emoteNamePopup).find(".tipsy-inner").text(title);
            $(emoteNamePopup).css('left', x.left - 25);
            $(emoteNamePopup).css('top', x.top - 32);
            $("div[data-reactid='.0.1.1']").append($(emoteNamePopup));
        });
        $(document).on("mouseleave", ".emote", function () {
            $(".tipsy").remove();
        });
    } else {
        $(document).off('mouseover', '.emote');
    }

    mainCore.saveSettings();
};

SettingsPanel.prototype.construct = function () {
    var self = this;

    panel = $("<div/>", {
        id: "bd-pane",
        class: "settings-inner",
        css: {
            "display": "none"
        }
    });

    var settingsInner = '' +
        '<div class="scroller-wrap">' +
        '   <div class="scroller settings-wrapper settings-panel">' +
        '       <div class="tab-bar TOP">' +
        '           <div class="tab-bar-item bd-tab" id="bd-settings-tab" onclick="settingsPanel.changeTab(\'bd-settings-tab\');">Settings</div>' +
        '           <div class="tab-bar-item bd-tab" id="bd-customcss-tab" onclick="settingsPanel.changeTab(\'bd-customcss-tab\');">Custom CSS</div>' +
        '           <div class="tab-bar-item bd-tab" id="bd-plugins-tab" onclick="settingsPanel.changeTab(\'bd-plugins-tab\');">Plugins</div>' +
        '           <div class="tab-bar-item bd-tab" id="bd-themes-tab" onclick="settingsPanel.changeTab(\'bd-themes-tab\');">Themes</div>' +
        '       </div>' +
        '       <div class="bd-settings">' +
        '               <div class="bd-pane control-group" id="bd-settings-pane" style="display:none;">' +
        '                   <ul class="checkbox-group">';



    for (var setting in settings) {

        var sett = settings[setting];
        var id = sett["id"];

        if (sett["implemented"] && !sett["hidden"]) {

            settingsInner += '' +
                '<li>' +
                '<div class="checkbox" onclick="settingsPanel.updateSetting(this);" >' +
                '<div class="checkbox-inner">' +
                '<input type="checkbox" id="' + id + '" ' + (settingsCookie[id] ? "checked" : "") + '>' +
                '<span></span>' +
                '</div>' +
                '<span>' + setting + " - " + sett["info"] +
                '</span>' +
                '</div>' +
                '</li>';
        }
    }

    var ccss = atob(localStorage.getItem("bdcustomcss"));
    customCssEditor.applyCustomCss(ccss, true, false);

    settingsInner += '</ul>' +
        '               </div>' +
        '' +
        '               <div class="bd-pane control-group" id="bd-customcss-pane" style="display:none;">' +
        '					<div id="editor-detached" style="display:none;">' +
        '						<h3>Editor Detached</h3>' +
        '						<button class="btn btn-primary" onclick="customCssEditor.attach(); return false;">Attach</button>' +
        '					</div>' +
        '                   <div id="bd-customcss-innerpane"><textarea id="bd-custom-css-ta">' + ccss + '</textarea></div>' +
        '               </div>' +
        '' +
        '               <div class="bd-pane control-group" id="bd-plugins-pane" style="display:none;">' +
        '                   <table class="bd-g-table">' +
        '                       <thead><tr><th>Name</th><th>Description</th><th>Author</th><th>Version</th><th></th><th></th></tr></thead><tbody>';

    $.each(bdplugins, function () {
        var plugin = this["plugin"];
        settingsInner += '' +
            '<tr>' +
            '   <td>' + plugin.getName() + '</td>' +
            '   <td width="99%"><textarea>' + plugin.getDescription() + '</textarea></td>' +
            '   <td>' + plugin.getAuthor() + '</td>' +
            '   <td>' + plugin.getVersion() + '</td>' +
            '   <td><button class="bd-psb" onclick="pluginModule.showSettings(\'' + plugin.getName() + '\'); return false;"></button></td>' +
            '   <td>' +
            '       <div class="checkbox" onclick="pluginModule.handlePlugin(this);">' +
            '       <div class="checkbox-inner">' +
            '               <input id="' + plugin.getName() + '" type="checkbox" ' + (pluginCookie[plugin.getName()] ? "checked" : "") + '>' +
            '               <span></span>' +
            '           </div>' +
            '       </div>' +
            '   </td>' +
            '</tr>';
    });

    settingsInner += '</tbody></table>' +
        '               </div>' +
        '               <div class="bd-pane control-group" id="bd-themes-pane" style="display:none;">';


    if (typeof (themesupport2) === "undefined") {
        settingsInner += '' +
            '                   Your version does not support themes. Download the latest version.';
    } else {
        settingsInner += '' +
            '                   <table class="bd-g-table">' +
            '                       <thead><tr><th>Name</th><th>Description</th><th>Author</th><th>Version</th><th></th></tr></thead><tbody>';
        $.each(bdthemes, function () {
            settingsInner += '' +
                '<tr>' +
                '   <td>' + this["name"].replace(/_/g, " ") + '</td>' +
                '   <td width="99%"><textarea>' + this["description"] + '</textarea></td>' +
                '   <td>' + this["author"] + '</td>' +
                '   <td>' + this["version"] + '</td>' +
                '   <td>' +
                '       <div class="checkbox" onclick="themeModule.handleTheme(this);">' +
                '           <div class="checkbox-inner">' +
                '               <input id="ti' + this["name"] + '" type="checkbox" ' + (themeCookie[this["name"]] ? "checked" : "") + '>' +
                '               <span></span>' +
                '           </div>' +
                '       </div>' +
                '   </td>' +
                '</tr>';
        });
        settingsInner += '</tbody></table>';
    }


    settingsInner += '' +
        '               </div>' +
        '' +
        '       </div>' +
        '   </div>' +
        '   <div style="background:#2E3136; color:#ADADAD; height:30px; position:absolute; bottom:0; left:0; right:0;">' +
        '       <span style="line-height:30px;margin-left:10px;">BetterDiscord v' + version + '(JSv' + jsVersion + ') by Jiiks</span>' +
        '       <span style="float:right;line-height:30px;margin-right:10px;"><a href="http://betterdiscord.net" target="_blank">BetterDiscord.net</a></span>' +
        '   </div>' +
        '</div>';

    function showSettings() {
        $(".tab-bar-item").removeClass("selected");
        settingsButton.addClass("selected");
        $(".form .settings-right .settings-inner").first().hide();
        panel.show();
        if (lastTab == "") {
            self.changeTab("bd-settings-tab");
        } else {
            self.changeTab(lastTab);
        }
    }

    settingsButton = $("<div/>", {
        class: "tab-bar-item",
        text: "BetterDiscord",
        id: "bd-settings-new",
        click: showSettings
    });

    panel.html(settingsInner);

    function defer() {
        if ($(".btn.btn-settings").length < 1) {
            setTimeout(defer, 100);
        } else {
            $(".btn.btn-settings").first().on("click", function () {

                function innerDefer() {
                    if ($(".modal-inner").first().is(":visible")) {

                        panel.hide();
                        var tabBar = $(".tab-bar.SIDE").first();

                        $(".tab-bar.SIDE .tab-bar-item").click(function () {
                            $(".form .settings-right .settings-inner").first().show();
                            $("#bd-settings-new").removeClass("selected");
                            panel.hide();
                        });

                        tabBar.append(settingsButton);
                        $(".form .settings-right .settings-inner").last().after(panel);
                        $("#bd-settings-new").removeClass("selected");
                    } else {
                        setTimeout(innerDefer, 100);
                    }
                }
                innerDefer();
            });
        }
    }
    defer();

};

/* BetterDiscordApp Utilities JavaScript
 * Version: 1.0
 * Author: Jiiks | http://jiiks.net
 * Date: 26/08/2015 - 15:54
 * https://github.com/Jiiks/BetterDiscordApp
 */

var _hash;

function Utils() {

}

Utils.prototype.getTextArea = function () {
    return $(".channel-textarea-inner textarea");
};

Utils.prototype.jqDefer = function (fnc) {
    if (window.jQuery) {
        fnc();
    } else {
        setTimeout(function () {
            this.jqDefer(fnc);
        }, 100);
    }
};

Utils.prototype.getHash = function () {
    $.getJSON("https://api.github.com/repos/Jiiks/BetterDiscordApp/commits/master", function (data) {
        _hash = data.sha;
        emoteModule.getBlacklist();
    });
};

Utils.prototype.loadHtml = function (html, callback) {
    var container = $("<div/>", {
        class: "bd-container"
    }).appendTo("body");

    //TODO Inject these in next core update
    html = '//cdn.rawgit.com/Jiiks/BetterDiscordApp/' + _hash + '/html/' + html + '.html';

    container.load(html, callback());
};

Utils.prototype.injectJs = function (uri) {
    $("<script/>", {
        type: "text/javascript",
        src: uri
    }).appendTo($("body"));
};

Utils.prototype.injectCss = function (uri) {
    $("<link/>", {
        type: "text/css",
        rel: "stylesheet",
        href: uri
    }).appendTo($("head"));
};

Utils.prototype.log = function (message) {
    console.info("%c[BetterDiscord]%c " + message, "color:teal; font-weight:bold;", "");
};

Utils.prototype.err = function (message) {
    console.info("%c[BetterDiscord]%c " + message, "color:red; font-weight:bold;", "");
};

/* BetterDiscordApp VoiceMode JavaScript
 * Version: 1.0
 * Author: Jiiks | http://jiiks.net
 * Date: 25/10/2015 - 19:10
 * https://github.com/Jiiks/BetterDiscordApp
 */

function VoiceMode() {

}

VoiceMode.prototype.obsCallback = function () {
    var self = this;
    if (settingsCookie["bda-gs-4"]) {
        self.disable();
        setTimeout(function () {
            self.enable();
        }, 300);
    }
};

VoiceMode.prototype.enable = function () {
    $(".scroller.guild-channels ul").first().css("display", "none");
    $(".scroller.guild-channels header").first().css("display", "none");
    $(".app.flex-vertical").first().css("overflow", "hidden");
    $(".chat.flex-vertical.flex-spacer").first().css("visibility", "hidden").css("min-width", "0px");
    $(".flex-vertical.channels-wrap").first().css("flex-grow", "100000");
    $(".guild-header .btn.btn-hamburger").first().css("visibility", "hidden");
};

VoiceMode.prototype.disable = function () {
    $(".scroller.guild-channels ul").first().css("display", "");
    $(".scroller.guild-channels header").first().css("display", "");
    $(".app.flex-vertical").first().css("overflow", "");
    $(".chat.flex-vertical.flex-spacer").first().css("visibility", "").css("min-width", "");
    $(".flex-vertical.channels-wrap").first().css("flex-grow", "");
    $(".guild-header .btn.btn-hamburger").first().css("visibility", "");
};

/* BetterDiscordApp PluginModule JavaScript
 * Version: 1.0
 * Author: Jiiks | http://jiiks.net
 * Date: 16/12/2015
 * https://github.com/Jiiks/BetterDiscordApp
 */

var pluginCookie = {};

function PluginModule() {

}

PluginModule.prototype.loadPlugins = function () {

    this.loadPluginData();

    $.each(bdplugins, function () {
        var plugin = this["plugin"];
        plugin.load();

        var name = plugin.getName();
        var enabled = false;

        if (pluginCookie.hasOwnProperty(name)) {
            enabled = pluginCookie[name];
        } else {
            pluginCookie[name] = false;
        }

        if (enabled) {
            plugin.start();
        }
    });
};

PluginModule.prototype.handlePlugin = function (checkbox) {

    var cb = $(checkbox).children().find('input[type="checkbox"]');
    var enabled = !cb.is(":checked");
    var id = cb.attr("id");
    cb.prop("checked", enabled);

    if (enabled) {
        bdplugins[id]["plugin"].start();
        pluginCookie[id] = true;
    } else {
        bdplugins[id]["plugin"].stop();
        pluginCookie[id] = false;
    }

    this.savePluginData();
};

PluginModule.prototype.showSettings = function (plugin) {
    if (bdplugins[plugin] != null) {
        if (typeof bdplugins[plugin].plugin.getSettingsPanel === "function") {
            var panel = bdplugins[plugin].plugin.getSettingsPanel();

            $(".modal-inner").off("click.bdpsm").on("click.bdpsm", function (e) {
                if ($("#bd-psm-id").length) {
                    $(".bd-psm").remove();
                } else {
                    $(".bd-psm").attr("id", "bd-psm-id");
                }

            });
            $(".modal").append('<div class="bd-psm"><div class="scroller-wrap" style="height:100%"><div id="bd-psm-s" class="scroller" style="padding:10px;"></div></div></div>');
            $("#bd-psm-s").append(panel);
        }
    }
};

PluginModule.prototype.loadPluginData = function () {
    var cookie = $.cookie("bd-plugins");
    if (cookie != undefined) {
        pluginCookie = JSON.parse($.cookie("bd-plugins"));
    }
};

PluginModule.prototype.savePluginData = function () {
    $.cookie("bd-plugins", JSON.stringify(pluginCookie), {
        expires: 365,
        path: '/'
    });
};

PluginModule.prototype.newMessage = function () {
    $.each(bdplugins, function () {
        if (!pluginCookie[this.plugin.getName()]) return;
        if (typeof this.plugin.onMessage === "function") {
            this.plugin.onMessage();
        }
    });
};

PluginModule.prototype.channelSwitch = function () {
    $.each(bdplugins, function () {
        if (!pluginCookie[this.plugin.getName()]) return;
        if (typeof this.plugin.onSwitch === "function") {
            this.plugin.onSwitch();
        }
    });
};

PluginModule.prototype.socketEvent = function (e, data) {
    $.each(bdplugins, function () {
        if (!pluginCookie[this.plugin.getName()]) return;
        if (typeof this.plugin.socketEvent === "function") {
            this.plugin.socketEvent(data);
        }
    });
};

PluginModule.prototype.rawObserver = function(e) {
    $.each(bdplugins, function() {
        if (!pluginCookie[this.plugin.getName()]) return;
        if(typeof this.plugin.observer === "function") {
            this.plugin.observer(e);
        }
    });
};


/* BetterDiscordApp ThemeModule JavaScript
 * Version: 1.0
 * Author: Jiiks | http://jiiks.net
 * Date: 16/12/2015
 * https://github.com/Jiiks/BetterDiscordApp
 */

var themeCookie = {};

function ThemeModule() {

}

ThemeModule.prototype.loadThemes = function () {
    this.loadThemeData();

    $.each(bdthemes, function () {
        var name = this["name"];
        var enabled = false;
        if (themeCookie.hasOwnProperty(name)) {
            if (themeCookie[name]) {
                enabled = true;
            }
        } else {
            themeCookie[name] = false;
        }

        if (enabled) {
            $("head").append('<style id="' + name + '">' + unescape(bdthemes[name]["css"]) + '</style>');
        }
    });
};

ThemeModule.prototype.handleTheme = function (checkbox) {

    var cb = $(checkbox).children().find('input[type="checkbox"]');
    var enabled = !cb.is(":checked");
    var id = cb.attr("id").substring(2);
    cb.prop("checked", enabled);

    if (enabled) {
        $("head").append('<style id="' + id + '">' + unescape(bdthemes[id]["css"]) + '</style>');
        themeCookie[id] = true;
    } else {
        $("#" + id).remove();
        themeCookie[id] = false;
    }

    this.saveThemeData();
};

ThemeModule.prototype.loadThemeData = function () {
    var cookie = $.cookie("bd-themes");
    if (cookie != undefined) {
        themeCookie = JSON.parse($.cookie("bd-themes"));
    }
};

ThemeModule.prototype.saveThemeData = function () {
    $.cookie("bd-themes", JSON.stringify(themeCookie), {
        expires: 365,
        path: '/'
    });
};


/*BDSocket*/

var bdSocket;
var bdws;

function BdWSocket() {
    bdws = this;
}

BdWSocket.prototype.start = function () {
    var self = this;
   /* $.ajax({
        method: "GET",
        url: "https://discordapp.com/api/gateway",
        headers: {
            authorization: localStorage.token.match(/\"(.+)\"/)[1]
        },
        success: function (data) {
            self.open(data.url);
        }
    });*/
};

BdWSocket.prototype.open = function (host) {
    utils.log("Socket Host: " + host);
    try {
        bdSocket = new WebSocket(host);
        bdSocket.onopen = this.onOpen;
        bdSocket.onmessage = this.onMessage;
        bdSocket.onerror = this.onError;
        bdSocket.onclose = this.onClose;
    } catch (err) {
        utils.log(err);
    }

};

BdWSocket.prototype.onOpen = function () {
    utils.log("Socket Open");
    var data = {
        op: 2,
        d: {
            token: JSON.parse(localStorage.getItem('token')),
            properties: JSON.parse(localStorage.getItem('superProperties')),
            v: 3
        }
    };
    bdws.send(data);
};

BdWSocket.prototype.onMessage = function (e) {

    var packet, data, type;
    try {
        packet = JSON.parse(e.data);
        data = packet.d;
        type = packet.t;
    } catch (err) {
        utils.err(err);
        return;
    }

    switch (type) {
    case "READY":
        bdSocket.interval = setInterval(function(){bdws.send({
            op: 1,
            d: Date.now()
        });}, data.heartbeat_interval);
        utils.log("Socket Ready");
        break;
    case "PRESENCE_UPDATE":
        pluginModule.socketEvent("PRESENCE_UPDATE", data);
        break;
    case "TYPING_START":
        pluginModule.socketEvent("TYPING_START", data);
        break;
    case "MESSAGE_CREATE":
        pluginModule.socketEvent("MESSAGE_CREATE", data);
        break;
    case "MESSAGE_UPDATE":
        pluginModule.socketEvent("MESSAGE_UPDATE", data);
        break;
    default:
        break;
    }

};

BdWSocket.prototype.onError = function (e) {
    utils.log("Socket Error - " + e.message);
};

BdWSocket.prototype.onClose = function (e) {
    utils.log("Socket Closed - " + e.code + " : " + e.reason);
    clearInterval(bdSocket.interval);
    bdws.start();
};

BdWSocket.prototype.send = function (data) {
    if (bdSocket.readyState == 1) {
        bdSocket.send(JSON.stringify(data));
    }
};

BdWSocket.prototype.getSocket = function () {
    return bdSocket;
};

/* BetterDiscordApp API for Plugins
 * Version: 1.0
 * Author: Jiiks | http://jiiks.net
 * Date: 11/12/2015
 * Last Update: 11/12/2015
 * https://github.com/Jiiks/BetterDiscordApp
 * 
 * Plugin Template: https://gist.github.com/Jiiks/71edd5af0beafcd08956
 */

function BdApi() {}

//Joins a server
//code = server invite code
BdApi.joinServer = function (code) {
    opublicServers.joinServer(code);
};

//Inject CSS to document head
//id = id of element
//css = custom css
BdApi.injectCSS = function (id, css) {
    $("head").append('<style id="' + id + '"></style>');
    $("#" + id).html(css);
};

//Clear css/remove any element
//id = id of element
BdApi.clearCSS = function (id) {
    $("#" + id).remove();
};

//Get another plugin
//name = name of plugin
BdApi.getPlugin = function (name) {
    if (bdplugins.hasOwnProperty(name)) {
        return bdplugins[name]["plugin"];
    }
    return null;
};

//Get ipc for reason
BdApi.getIpc = function () {
    return betterDiscordIPC;
};

//Get BetterDiscord Core
BdApi.getCore = function () {
    return mainCore;
};

//Attempts to get user id by username
//Name = username
//Since Discord hides users if there's too many, this will often fail
BdApi.getUserIdByName = function (name) {
    var users = $(".member-username");

    for (var i = 0; i < users.length; i++) {
        var user = $(users[i]);
        if (user.text() == name) {
            var avatarUrl = user.closest(".member").find(".avatar-small").css("background-image");
            return avatarUrl.match(/\d+/);
        }
    }
    return null;
};

//Attempts to get username by id
//ID = user id
//Since Discord hides users if there's too many, this will often fail
var gg;
BdApi.getUserNameById = function (id) {
    var users = $(".avatar-small");

    for (var i = 0; i < users.length; i++) {
        var user = $(users[i]);
        var url = user.css("background-image");
        if (id == url.match(/\d+/)) {
            return user.parent().find(".member-username").text();
        }
    }
    return null;
};

//Set current game
//game = game
BdApi.setPlaying = function (game) {
    bdws.send({
        "op": 3,
        "d": {
            "idle_since": null,
            "game": {
                "name": game
            }
        }
    });
};

//Set current status
//idle_since = date
//status = status
BdApi.setStatus = function (idle_since, status) {
    bdws.send({
        "op": 3,
        "d": {
            "idle_since": idle_since,
            "game": {
                "name": status
            }
        }
    });
};
