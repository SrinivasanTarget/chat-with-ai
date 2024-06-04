import { ClipEmbedding, similarity, SimilarityType } from "llamaindex";

async function main() {
  const clip = new ClipEmbedding();

  const text1 = "coke advertisement";
  const text2 = "pepsi advertisement";
  const image =
    "https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/coca_cola_advertisement.png";

  const [textEmbedding1, textEmbedding2, imageEmbedding] = await Promise.all([
    clip.getTextEmbedding(text1),
    clip.getTextEmbedding(text2),
    clip.getImageEmbedding(image),
  ]);

  const sim1 = similarity(
    textEmbedding1,
    imageEmbedding,
    SimilarityType.DEFAULT
  );
  const sim2 = similarity(
    textEmbedding2,
    imageEmbedding,
    SimilarityType.DEFAULT
  );

  console.log(
    `The similarity between the text "${text1}" and the image is ${sim1}`
  );
  console.log(
    `The similarity between the text "${text2}" and the image is ${sim2}`
  );
}

void main();
