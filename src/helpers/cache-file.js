const fs  = require('fs');

class CacheFile {
    verify(file, minutes) {
        if(fs.existsSync(file)) {
            let stats = fs.statSync(file);

            const last_update_time = new Date(stats.ctime)

            const update_time = new Date();
            update_time.setMinutes(last_update_time.getMinutes() + minutes);

            return new Date() > update_time ? false : true;
        }

        return false;
    }

    read(file) {
        return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : false;
    }

    save(file, data) {
        fs.writeFile(file, JSON.stringify(data), err => {
            console.log(`Error: ${err}`);
        });
    }
}

module.exports = new CacheFile