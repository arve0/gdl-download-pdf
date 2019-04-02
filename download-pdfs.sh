mkdir -p English
cd English
node ../download-books-from-rss.js https://opds.digitallibrary.io/v1/en/root.xml
cd ..
mkdir -p Español
cd Español
node ../download-books-from-rss.js https://opds.digitallibrary.io/v1/es-es/root.xml