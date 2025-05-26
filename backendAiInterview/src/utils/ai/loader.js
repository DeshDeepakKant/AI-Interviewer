import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

const fileLoading = async(filePath)=>{
    const file = filePath
    const loader = new PDFLoader(file);

    const docs = await loader.load();

    console.log(docs[0].pageContent + " " + docs[1].pageContent)
}

export default fileLoading