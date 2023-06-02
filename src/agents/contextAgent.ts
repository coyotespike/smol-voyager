import { LLMUtil } from "@utils";

export default async function contextAgent({
  query,
  topResultsNum,
  vectorStore,
}: {
  query: string;
  topResultsNum: number;
  vectorStore: any;
}) {
  const embedding = await LLMUtil.createEmbedding(query);
  const results = await vectorStore.similaritySearchVectorWithScore(
    embedding,
    topResultsNum
  );

  const sorted = results.sort(([, a]: any[], [, b]: any[]) => b - a);
  return sorted.map(([doc]: any[]) => doc.metadata.task);
}
