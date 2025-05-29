import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

const fileLoading = async(filePath)=>{
    const file = filePath
    const loader = new PDFLoader(file);

    const docs = await loader.load();
    const pages = docs.map((doc) => doc.pageContent?.trim())

    const content = pages.join(" ");

    return content

}

export default fileLoading