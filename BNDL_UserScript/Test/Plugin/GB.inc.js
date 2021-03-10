console.log("Google Books Extension 20210310.0");

// Hijack Start
const _hiJACK = setInterval(function() {
    if(start) {
        console.log("start_found");
        const _oldstart = start;
        start = function() {
            console.log(arguments);
            // obtain details needed
            const args = arguments;
            const meta = args[0].metadata;
            totp = meta.num_pages;
            let authors = meta.authors.split(/,\s*/)[0];
            let title = meta.title.split(/,\s*/)[0]; //0=user language, 1=alternative language
            let imprint = meta.publisher.split(/,\s*/)[0];
            let pDate = meta.pub_date.split(/\./); //0=year, 1=month, 2=date
            let link = "https://play.google.com/store/books/details?id=" + meta.volume_id;
            const toc = args[0].toc_entry;
            let toc_arr = [];
            toc.forEach(v => toc_arr[v.page_index] = v.label);
            console.log(imprint, authors, title, pDate, totp, link, toc_arr);
            // Finish obtain book detail, throw back to original procedure
            _oldstart.apply(this, arguments);
        }
        clearInterval(_hiJACK);
    }
}, 1);
// Add Observer
