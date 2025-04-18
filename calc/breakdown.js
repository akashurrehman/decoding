// ================= Word Breakdown & Cipher Chart ==================

function getSum(total, num) { // used to .reduce() array, adds all values
	return total + num;
}

function gemCalcModeLabel(curCipher) {
	if (optGemMultCharPos && curCipher.LetterCount > 0) return ' - x1 ... x' + curCipher.LetterCount
	else if (optGemMultCharPosReverse && curCipher.LetterCount > 0) return ' - x' + curCipher.LetterCount + ' ... x1'
	return ""
}

function updateWordBreakdown(impName = breakCipher, impBool = false, chartUpd = true) { // false - preview temporary (hover), true - lock breakdown to a specific cipher
	var x, curCipher, curCiphCol, cSpot
	var o, oo, acw, acl

	updateEnabledCipherCount()
	$("#BreakTableContainer").removeClass("") // unhide breakdown
	$("#BreakdownDetails").attr("style", "") // reset padding (gematria card)

	if (impBool == true) breakCipher = impName // lock to a specific cipher

	if (!optShowCipherChart) $("#ChartSpot").attr("style", "border: none;"); // reset gradient for cipher chart
	if (enabledCiphCount == 0 || breakCipher == "" && impName == "") {
		document.getElementById("ChartSpot").innerHTML = ""
		$("#ChartSpot").attr("style", "border: none;"); // reset gradient for cipher chart
		return;
	}

	for (x = 0; x < cipherList.length; x++) {
		if (cipherList[x].cipherName == impName) {
			cSpot = x
			if (chartUpd && cipherList[x].cipherName !== "Novenary" && cipherList[x].cipherName !== "Hebrew Novenary") {
				updateCipherChart(cipherList[x]);
			}
			break
		}
	}

	curCipher = cipherList[cSpot]
	curCiphCol = (optColoredCiphers) ? 'color: hsl(' + curCipher.H + ' ' + curCipher.S + '% ' + curCipher.L + '% / 1)' : ''
	curGradCol = (optColoredCiphers) ? 'hsl(' + curCipher.H + ' ' + curCipher.S + '% ' + curCipher.L + '% / 0.2)' : 'hsl(0 0% 0% / 0.1)'

	const phrase = sVal().replace(/[^A-Za-z\u0590-\u05FF]/g, ""); // includes Hebrew letters
	const letterCount = phrase.length;
	console.log("Lettter count:", letterCount)


	var leftToRightBreak = true
	// if Hebrew Aleph is assigned in current cipher
	if (curCipher.cArr.indexOf(1488) > -1) {
		curCipher.calcBreakdown(sVal().replace(/[\u0591-\u05BD\u05BF-\u05C7]/g, "")) // remove Hebrew vowels, exclude dash
	}
	// if Arabic Alef is assigned in current cipher
	if (curCipher.cArr.indexOf(1575) > -1) {
		curCipher.calcBreakdown(sVal().replace(/[\u0600-\u061F\u0640\u064B-\u066D\u06D4\u06D6-\u06ED\u06F0-\u06F9]/g, "")) // remove Arabic marks and non letter characters
	}
	// use right to left writing (Hebrew, Arabic)
	if (curCipher.cArr.indexOf(1488) > -1 || curCipher.cArr.indexOf(1575) > -1) {
		curCipher.cp.reverse(); curCipher.cv.reverse(); curCipher.sumArr.reverse() // right-to-left direction
		if (curCipher.WordCount > 1) {
			curCipher.cp.push(curCipher.cp.shift()) // remove first element and add to the end of array (space, used for word sum)
			curCipher.cv.push(curCipher.cv.shift())
		}
		leftToRightBreak = false
	} else { // left to right, use regular word breakdown
		curCipher.calcBreakdown(sVal()) // calculate breakdown for current phrase
	}

	if (curCipher.sumArr.length > 0) {

		var oStart = ''; var o = '';

		var RTLclass = '';
		if (!leftToRightBreak) RTLclass = 'BreakRTL' // use different container padding for right to left direction

		if (optLetterWordCount == true) {
			if (curCipher.LetterCount > 1 || curCipher.LetterCount == 0) { acl = " letters, " } else { acl = " letter, " }
			if (curCipher.WordCount > 1) { acw = " words" } else { acw = " word" }
			oStart += '<div class="LetterCounts">' + curCipher.LetterCount + acl + curCipher.WordCount + acw + '</div>'
		}

		if (optCompactBreakdown == true) {
			var simplePhr = ""
			if (optAllowPhraseComments) {
				simplePhr = sValNoComments() // exclude text inside [...]
			} else {
				simplePhr = sVal() // display full phrase
			}
			oStart += '<div id="SimpleBreak">'
			oStart += '<span class="breakPhrase">' + simplePhr + '</span><span class="breakPhrase"> = </span><span class="breakSum">' + curCipher.sumArr.reduce(getSum) + ' </span>' // add all values in array
			oStart += '<span class="breakCipher"><font style="' + curCiphCol + '"> (' + curCipher.cipherName + gemCalcModeLabel(curCipher) + ')</font></span>'
		}

		if (optWordBreakdown == true && curCipher.cp.length <= chLimit) { // character limit, calculated even if out of screen bounds
			var tdCount = 0; var wCount = 0;

			o += '</div><div id="BreakTableContainer" class="' + RTLclass + '"><table class="BreakTable">'
			o += '<tbody><tr>'

			if (leftToRightBreak) { // left to right
				for (x = 0; x < curCipher.cp.length; x++) {
					if (curCipher.cp[x] !== " ") {
						if (String(curCipher.cp[x]).substring(0, 3) == "num") {
							o += '<td class="BreakChar" style="' + curCiphCol + '">' + curCipher.cp[x].substring(3, curCipher.cp[x].length) + '</td>'
						} else {
							o += '<td class="BreakChar" style="' + curCiphCol + '">' + String.fromCharCode(curCipher.cp[x]) + '</td>'
						}
					} else {
						o += '<td class="BreakWordSum" rowspan="2">' + curCipher.sumArr[wCount] + '</td>'
						wCount++
					}
					tdCount++
				}
				o += '<td class="BreakPhraseSum" rowspan="2"><font style="' + curCiphCol + '">' + curCipher.sumArr.reduce(getSum) + '</font></td>'
				o += '</tr><tr>'
				tdCount++
				for (z = 0; z < x; z++) {
					if (curCipher.cv[z] !== " ") {
						o += '<td class="BreakVal">' + curCipher.cv[z] + '</td>'
					}
				}
			} else { // right to left (Hebrew, Arabic)
				o += '<td class="BreakPhraseSum" rowspan="2"><font style="' + curCiphCol + '">' + curCipher.sumArr.reduce(getSum) + '</font></td>'
				var curBreakWord = '' // current word, added to main 'o' string
				for (x = 0; x < curCipher.cp.length; x++) {
					if (curCipher.cp[x] !== " ") {
						if (String(curCipher.cp[x]).substring(0, 3) == "num") {
							curBreakWord += '<td class="BreakChar" style="' + curCiphCol + '">' + curCipher.cp[x].substring(3, curCipher.cp[x].length) + '</td>'
						} else {
							curBreakWord += '<td class="BreakChar" style="' + curCiphCol + '">' + String.fromCharCode(curCipher.cp[x]) + '</td>'
						}
					} else {
						curBreakWord = '<td class="BreakWordSum" rowspan="2">' + curCipher.sumArr[wCount] + '</td>' + curBreakWord // prepend word sum (displayed on the left)
						o += curBreakWord
						curBreakWord = ''
						wCount++
					}
					tdCount++
				}
				if (curCipher.WordCount == 1) o += curBreakWord // single word
				o += '</tr><tr>'
				tdCount++
				for (z = 0; z < x; z++) {
					if (curCipher.cv[z] !== " ") {
						o += '<td class="BreakVal">' + curCipher.cv[z] + '</td>'
					}
				}
			}
			ciphEndClass = (leftToRightBreak) ? "CipherEnd" : "CipherEndRTL"
			if (optCompactBreakdown == true) o += '</tr><tr><td colspan=' + tdCount + ' class="' + ciphEndClass + '"><font style="' + curCiphCol + '">' + curCipher.cipherName + gemCalcModeLabel(curCipher) + '</font></td></tr></table></div>'
			else o += '</tr></tbody></table></div>'

			o = oStart + o // prepend phrase, word/letter count

		} else if (optWordBreakdown == true && curCipher.cp.length > chLimit) { // breakdown for long phrases

			var wrdCount = 0; var z = 0;
			var breakArr = buildLongBreakdown(curCipher) // index of word in phraseBox, used to mark table end
			var curBreakRow = '' // current row, added to main 'o' string

			if (leftToRightBreak) { // left to right
				curBreakRow = '<table class="BreakTableRow" style="padding-top: 0.5em;"><tbody><tr>'
				for (x = 0; x < curCipher.cp.length; x++) {
					if (curCipher.cp[x] !== " ") {
						if (String(curCipher.cp[x]).substring(0, 3) == "num") {
							curBreakRow += '<td class="BreakChar">' + curCipher.cp[x].substring(3, curCipher.cp[x].length) + '</td>'
						} else {
							curBreakRow += '<td class="BreakChar">' + String.fromCharCode(curCipher.cp[x]) + '</td>'
						}
					} else { // show character values and word sum if space
						curBreakRow += '<td class="BreakWordSum" rowspan="2"><font style="' + curCiphCol + '">' + curCipher.sumArr[wrdCount] + '</font></td>'
						if (breakArr.indexOf(wrdCount) > -1 || wrdCount == curCipher.WordCount - 1) { // include values for last word
							curBreakRow += '</tr><tr>'
							for (z; z < x; z++) {
								if (curCipher.cv[z] !== " ") {
									curBreakRow += '<td class="BreakValDark">' + curCipher.cv[z] + '</td>'
								}
							}
							curBreakRow += '</tr></tbody></table>'
							if (wrdCount !== curCipher.WordCount - 1) curBreakRow += '<table class="BreakTableRow"><tbody><tr>'
						}
						wrdCount++
					}
				}
				if (curCipher.cp.indexOf(" ") == -1) { // show character values if one long word (has no " ")
					curBreakRow += '</tr><tr>'
					for (z; z < x; z++) {
						if (curCipher.cv[z] !== " ") {
							curBreakRow += '<td class="BreakValDark">' + curCipher.cv[z] + '</td>'
						}
					}
					curBreakRow += '</tr></tbody></table>'
				}
				o = '</div><div id="BreakTableContainer" class="' + RTLclass + '">' + curBreakRow
			} else { // right to left (Hebrew, Arabic)
				curBreakRow = '<table class="BreakTableRow"><tbody><tr>'
				if (curCipher.WordCount > 1) curBreakRow += '<td class="BreakWordSum" rowspan="2"><font style="' + curCiphCol + '">' + curCipher.sumArr[wrdCount] + '</font></td>'
				for (x = 0; x < curCipher.cp.length; x++) {
					if (curCipher.cp[x] !== " ") {
						if (String(curCipher.cp[x]).substring(0, 3) == "num") {
							curBreakRow += '<td class="BreakChar">' + curCipher.cp[x].substring(3, curCipher.cp[x].length) + '</td>'
						} else {
							curBreakRow += '<td class="BreakChar">' + String.fromCharCode(curCipher.cp[x]) + '</td>'
						}
					} else { // show character values and word sum if space or last character
						if (breakArr.indexOf(wrdCount) > -1 || wrdCount == curCipher.WordCount - 1) { // include values for last word
							curBreakRow += '</tr><tr>'
							for (z; z < x; z++) {
								if (curCipher.cv[z] !== " ") {
									curBreakRow += '<td class="BreakValDark">' + curCipher.cv[z] + '</td>'
								}
							}
							curBreakRow += '</tr></tbody></table>'
							o = curBreakRow + o // prepend current row to main table
							if (wrdCount !== curCipher.WordCount - 1) curBreakRow = '<table class="BreakTableRow"><tbody><tr>'
						}
						wrdCount++
						if (wrdCount !== curCipher.WordCount) curBreakRow += '<td class="BreakWordSum" rowspan="2"><font style="' + curCiphCol + '">' + curCipher.sumArr[wrdCount] + '</font></td>'
					}
				}
				if (curCipher.cp.indexOf(" ") == -1) { // show character values if one long word (has no " ")
					curBreakRow += '</tr><tr>'
					for (z; z < x; z++) {
						if (curCipher.cv[z] !== " ") {
							curBreakRow += '<td class="BreakValDark">' + curCipher.cv[z] + '</td>'
						}
					}
					curBreakRow += '</tr></tbody></table>'
					o = curBreakRow + o // prepend current row to main table
				}
				o = '</div><div id="BreakTableContainer" class="' + RTLclass + '"><div style="padding: 0.25em"></div>' + o // prepend opening div, include padding
			}
			o = oStart + o // prepend phrase, word/letter count
			if (optCompactBreakdown == true) {
				o += '<div id="BreakSumLong"><span class="breakSumDark">' + curCipher.sumArr.reduce(getSum) + ' </span>'
				o += '<span class="breakCipher" style="' + curCiphCol + '">' + curCipher.cipherName + gemCalcModeLabel(curCipher) + '</span></div></div>'
			} else {
				o += '<div style="padding: 0.5em"></div>'
			}
		}
	} else {
		o = ""
	}
}

function buildLongBreakdown(curCipher) {
	var i;
	var newLine = true; words = 0; n = "";
	var breakArr = []; var widthCount = 0;

	for (i = 0; i < curCipher.cv.length; i++) {
		if (curCipher.cv[i] !== " ") {
			if (n == "") { n = i }
			if (curCipher.cv[i] > 99) {
				widthCount += 1.5
			} else {
				widthCount++
			}
			if (widthCount > maxRowWidth && newLine == false) {
				breakArr.push(words - 1)
				widthCount = 0
				i = n - 1
				newLine = true
			}
		} else {
			widthCount += 2
			words++
			n = ""
			newLine = false
		}
	}
	return breakArr
}

function updateCipherChart(curCipher) {
	if (optShowCipherChart == false) {
		document.getElementById("ChartSpot").innerHTML = "";
		return;
	}

	curCiphCol = optColoredCiphers ? 'color: hsl(' + curCipher.H + ' ' + curCipher.S + '% ' + curCipher.L + '% / 1)' : '';
	curGradCol = optColoredCiphers ? 'hsl(' + curCipher.H + ' ' + curCipher.S + '% ' + curCipher.L + '% / 0.2)' : 'hsl(0 0% 0% / 0.1)';

	var o = 'background: var(--body-bg-accent);';
	if (optGradientCharts) {
		o = 'background: ' + bgCol + ' -webkit-linear-gradient(0deg,' + curGradCol + ', rgba(0,0,0,0.0));';
		o += 'background: ' + bgCol + ' -o-linear-gradient(0deg,' + curGradCol + ', rgba(0,0,0,0.0));';
		o += 'background: ' + bgCol + ' -moz-linear-gradient(0deg,' + curGradCol + ', rgba(0,0,0,0.0));';
		o += 'background: ' + bgCol + ' linear-gradient(0deg,' + curGradCol + ', rgba(0,0,0,0.0));';
	}
	o += 'min-height: 166px; margin-top: 1em; margin-bottom: 0.5em; padding: 0.5em;';
	$("#ChartSpot").attr("style", o);

	var shouldSplit = curCipher.cArr.length > 15;
	var halfL = shouldSplit ? Math.ceil(curCipher.cArr.length / 2) : curCipher.cArr.length;
	var colspan = shouldSplit ? Math.ceil(curCipher.cArr.length / 2) : curCipher.cArr.length;

	var o = '<table id="ChartTable">';
	o += '<tbody><tr>';
	o += '<td id="capsNameChartBtn" colspan="' + colspan + '">';
	o += '<font style="font-size: 150%; font-weight: 500; ' + curCiphCol + '">' + curCipher.cipherName + '</font>';
	o += '</td>';
	o += '</tr><tr>';

	for (var x = 0; x < curCipher.cArr.length; x++) {
		if (shouldSplit && x === halfL) {
			o += '</tr><tr>';
			for (var y = 0; y < x; y++) {
				o += '<td class="ChartVal">' + curCipher.vArr[y] + '</td>';
			}
			o += '</tr><tr>';
		}
		o += (showCapsCipherChart && !curCipher.caseSensitive)
			? '<td class="ChartChar" style="' + curCiphCol + '">' + String.fromCodePoint(curCipher.cArr[x]).toUpperCase() + '</td>'
			: '<td class="ChartChar" style="' + curCiphCol + '">' + String.fromCodePoint(curCipher.cArr[x]) + '</td>';
	}

	if (shouldSplit && curCipher.cArr.length % 2 !== 0) {
		o += '<td class="ChartChar" style="' + curCiphCol + '"></td>';
	}

	o += '</tr><tr>';

	var y = shouldSplit ? halfL : 0;
	for (; y < curCipher.cArr.length; y++) {
		o += '<td class="ChartVal">' + curCipher.vArr[y] + '</td>';
	}

	if (shouldSplit && curCipher.cArr.length % 2 !== 0) {
		o += '<td class="ChartVal"></td>';
	}

	o += '</tr></tbody></table>';

	document.getElementById("ChartSpot").innerHTML = o;
}

