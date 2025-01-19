// BannerSys.js
const fs = require('fs');
const path = require('path');

const makeId = require('../utility/makeId');
const bannerFilePath = path.join(__dirname, '../../filedb/bannerList.json');

class BannerSys {
    /**
     * loadBannerData: Load banner data from bannerList.json.
     * @returns {Array} - Array of banner objects.
     */
    static loadBannerData() {
        try { return JSON.parse(fs.readFileSync(bannerFilePath, 'utf8')); }
        catch (err) { console.error('Error reading bannerList.json:', err); return []; }
    }

    /**
     * saveBannerData: Save updated banner data to bannerList.json.
     * @param {Array} banners - Array of banner objects to save.
     */
    static saveBannerData(banners) {
        try { fs.writeFileSync(bannerFilePath, JSON.stringify(banners, null, 2), 'utf8'); }
        catch (err) { console.error('Error writing to bannerList.json:', err); }
    }

    /**
     * create: Create a new banner. banner has property id, title, image_loc, start_date, end_date
     * @param {string} title - Title of the banner.
     * @param {string} start_date - Start date of the banner (default: -1).
     * @param {string} end_date - End date of the banner (default: -1).
     * @param {string} ext - Extension of the banner image.
     * @returns {Object} - The newly created banner object.
     */
    static create(title, start_date = -1, end_date = -1, ext) {
        const banners = this.loadBannerData();
        
        const id = makeId();
        const newBanner = {
            id,
            title,
            image_loc: `/event/banner/${id}${ext}`,
            start_date,
            end_date
        };

        banners.push(newBanner);
        this.saveBannerData(banners);

        return newBanner;
    }

    /**
     * read: Read banner(s) by id.
     * @param {string|string[]|null} id - ID(s) of the banner(s) to read. If null, return all banners.
     * @returns {Object|Object[]} - The banner(s) matching the id(s), or all banners if id is null.
     */
    static read(id = null) {
        const banners = this.loadBannerData();
        if (id === null) { return banners; }
        if (Array.isArray(id)) { return banners.filter(banner => id.includes(banner.id)); }
        return banners.find(banner => banner.id === id) || null;
    }

    /**
     * delete: Delete banner(s) by id.
     * @param {string|string[]} id - ID(s) of the banner(s) to delete. If null, do nothing.
     * @returns {boolean} - True if deletion was successful, false otherwise.
     */
    static delete(id) {
        if (!id) return false;

        const banners = this.loadBannerData();
        const updatedBanners = Array.isArray(id) ? banners.filter(banner => !id.includes(banner.id)) : banners.filter(banner => banner.id !== id);

        if (updatedBanners.length === banners.length) return false; // No banners deleted

        this.saveBannerData(updatedBanners);
        return true;
    }
}

module.exports = BannerSys;
