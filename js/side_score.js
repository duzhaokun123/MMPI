longform = true;    // true==long form, false==short form
gender = 0;		// 0==male, 1==female

function set_gender_side(g) {
    gender = g;
}

function set_longform_side(lf) {
    longform = lf;
}

function update_score_side(form) {
    let ans = [undefined];
    for (let i = 1; i < questions.length; ++i) {
        let rbv = radio_value(form.elements["Q" + i]);
        if (rbv) {
            ans.push(rbv);
        } else {
            ans.push("?");
        }
    }

    // Variable declarations
    let i, j, tscale, q, n, s, rp;
    let k, rawscore, kscore, tscore, percent;
    let t_cnt, f_cnt, cs_cnt, pe;

    let tscoreArray = [];

    // Count the number of True, False, and Can't Say answers
    n = longform ? questions.length : 371;
    t_cnt = 0;
    f_cnt = 0;
    cs_cnt = 0;
    for (q = 1; q < n; ++q) {
        switch (ans[q]) {
            case "T":
                ++t_cnt;
                break;
            case "F":
                ++f_cnt;
                break;
            default:
                ++cs_cnt;
                break;
        }
    }
    --q;

    // Score the TRIN/VRIN scales
    // Iterate the *RIN scales
    for (i = 0; i < rin.length; ++i) {
        // Start with default score
        rawscore = rin[i][0][2];
        // Iterate all the answer pairs
        for (j = 0; j < rin[i][1].length; ++j) {
            // Get reference to answer pair
            rp = rin[i][1][j];
            // If answers match, update the raw score
            if (ans[rp[0]] === rp[1] && ans[rp[2]] === rp[3]) {
                rawscore += rp[4];
            }
        }
    }
    // Score the scales and critical items
    k = 0;
    pe = 0;
    // Iterate all the scales
    for (i = 0; i < scales.length; ++i) {
        n = 0;
        rawscore = 0;
        // Get the T score table, critcal items will not have this (undefined)
        tscale = scales[i][3 + gender];
        // Iterate the True question list
        for (j = 0; j < scales[i][1].length; ++j) {
            // Get the question number
            q = scales[i][1][j];
            // Act upon the answer to that question
            switch (ans[q]) {
                // True
                case "T":
                    // Increment the answer count
                    ++n;
                    // Increment raw score only if True
                    ++rawscore;
                    break;
                case "F":
                    // Increment the answer count
                    ++n;
                    break;
            }
        }
        // Iterate the False question list (same procedure as True above)
        for (j = 0; j < scales[i][2].length; ++j) {
            q = scales[i][2][j];
            switch (ans[q]) {
                case "F":
                    ++n;
                    ++rawscore;
                    break;
                case "T":
                    ++n;
                    break;
            }
        }
        // Add scale results to scale table
        // T score table must be defined, otherwise this is a critical item
        if (tscale !== undefined) {
            // Capture K for future use
            if (scales[i][0][0] === "K") {
                k = rawscore;
            }
            // If there is a K correction, use it
            if (tscale[0]) {
                // Adjust with K
                kscore = k * tscale[0] + rawscore;
                // Round off and make integer
                kscore = Math.floor(kscore + 0.5);
                // T score lookup of corrected score
                tscore = tscale[kscore + 1];
                // No K correction
            } else {
                // K score is undefinded
                kscore = undefined;
                // T score lookup of raw score
                tscore = tscale[rawscore + 1];
            }
            // Calculate percent answered
            percent = n * 100 / (scales[i][1].length + j);
            // Append results to score table

            tscoreArray.push(tscore);

            // Update profile elevation for the 8 scales
            switch (scales[i][0][1]) {
                case "Hs":
                case "D":
                case "Hy":
                case "Pd":
                case "Pa":
                case "Pt":
                case "Sc":
                case "Ma":
                    pe += tscore;
                    break;
            }
        }
    }

    let L = tscoreArray[3]
    let F = tscoreArray[0]
    let K = tscoreArray[4]
    let Hs = tscoreArray[6]
    let D = tscoreArray[7]
    let Hy = tscoreArray[8]
    let Pd = tscoreArray[9]
    let Mf = gender === 0 ? tscoreArray[10] : tscoreArray[11]
    let Pa = tscoreArray[12]
    let Pt = tscoreArray[13]
    let Sc = tscoreArray[14]
    let Ma = tscoreArray[15]
    let Si = tscoreArray[16]

    document.getElementById("side_score").innerHTML = `
    <p> T: ${t_cnt}</p>
    <p> F: ${f_cnt}</p>
    <p> ?: ${cs_cnt}</p>
    <p> L: ${L} </p>
    <p> F: ${F} </p>
    <p> K: ${K} </p>
    <p> Hs: ${Hs} </p>
    <p> D: ${D} </p>
    <p> Hy: ${Hy} </p>
    <p> Pd: ${Pd} </p>
    <p> Mf: ${Mf} </p>
    <p> Pa: ${Pa} </p>
    <p> Pt: ${Pt} </p>
    <p> Sc: ${Sc} </p>
    <p> Ma: ${Ma} </p>
    <p> Si: ${Si} </p>
    `
}

function heightToTop(ele) {
    //ele为指定跳转到该位置的DOM节点
    let root = document.body;
    let height = 0;
    do {
        height += ele.offsetTop;
        ele = ele.offsetParent;
    } while (ele !== root)
    return height;
}

function check_miss(form) {
    for (let i = 1; i < questions.length; ++i) {
        let rbv = radio_value(form.elements["Q" + i]);
        if (!rbv) {
            window.scrollTo({
                top: heightToTop(document.getElementById("Q" + i)) - 100,
                behavior: "smooth"
            })
            return
        }
    }
    alert("无漏题")
}