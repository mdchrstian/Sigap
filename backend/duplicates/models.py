from django.db import models
from pgvector.django import HnswIndex, VectorField


class ReportEmbedding(models.Model):
    report = models.OneToOneField("reports.Report", on_delete=models.CASCADE,
                                  related_name="embedding")
    vector = VectorField(dimensions=1536)
    model = models.CharField(max_length=64)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [HnswIndex(name="dup_emb_hnsw", fields=["vector"], m=16,
                             ef_construction=64, opclasses=["vector_cosine_ops"])]
