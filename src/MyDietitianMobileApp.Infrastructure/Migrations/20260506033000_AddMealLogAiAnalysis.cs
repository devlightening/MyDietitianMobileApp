using Microsoft.EntityFrameworkCore.Migrations;
using MyDietitianMobileApp.Infrastructure.Persistence;

#nullable disable

namespace MyDietitianMobileApp.Infrastructure.Migrations
{
    [Microsoft.EntityFrameworkCore.Infrastructure.DbContext(typeof(AppDbContext))]
    [Migration("20260506033000_AddMealLogAiAnalysis")]
    public partial class AddMealLogAiAnalysis : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                ALTER TABLE "ClientMealLogs"
                ADD COLUMN IF NOT EXISTS "FoodName" character varying(160);
            """);

            migrationBuilder.Sql("""
                ALTER TABLE "ClientMealLogs"
                ADD COLUMN IF NOT EXISTS "CaloriesKcal" integer;
            """);

            migrationBuilder.Sql("""
                ALTER TABLE "ClientMealLogs"
                ADD COLUMN IF NOT EXISTS "ProteinGrams" numeric(8,2);
            """);

            migrationBuilder.Sql("""
                ALTER TABLE "ClientMealLogs"
                ADD COLUMN IF NOT EXISTS "CarbsGrams" numeric(8,2);
            """);

            migrationBuilder.Sql("""
                ALTER TABLE "ClientMealLogs"
                ADD COLUMN IF NOT EXISTS "FatGrams" numeric(8,2);
            """);

            migrationBuilder.Sql("""
                ALTER TABLE "ClientMealLogs"
                ADD COLUMN IF NOT EXISTS "PortionCount" numeric(5,2) NOT NULL DEFAULT 1;
            """);

            migrationBuilder.Sql("""
                ALTER TABLE "ClientMealLogs"
                ADD COLUMN IF NOT EXISTS "AiConfidence" numeric(4,2);
            """);

            migrationBuilder.Sql("""
                ALTER TABLE "ClientMealLogs"
                ADD COLUMN IF NOT EXISTS "AnalysisJson" text;
            """);

            migrationBuilder.Sql("""
                ALTER TABLE "ClientMealLogs"
                ADD COLUMN IF NOT EXISTS "Source" character varying(32) NOT NULL DEFAULT 'manual';
            """);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                ALTER TABLE "ClientMealLogs"
                DROP COLUMN IF EXISTS "FoodName";
            """);

            migrationBuilder.Sql("""
                ALTER TABLE "ClientMealLogs"
                DROP COLUMN IF EXISTS "CaloriesKcal";
            """);

            migrationBuilder.Sql("""
                ALTER TABLE "ClientMealLogs"
                DROP COLUMN IF EXISTS "ProteinGrams";
            """);

            migrationBuilder.Sql("""
                ALTER TABLE "ClientMealLogs"
                DROP COLUMN IF EXISTS "CarbsGrams";
            """);

            migrationBuilder.Sql("""
                ALTER TABLE "ClientMealLogs"
                DROP COLUMN IF EXISTS "FatGrams";
            """);

            migrationBuilder.Sql("""
                ALTER TABLE "ClientMealLogs"
                DROP COLUMN IF EXISTS "PortionCount";
            """);

            migrationBuilder.Sql("""
                ALTER TABLE "ClientMealLogs"
                DROP COLUMN IF EXISTS "AiConfidence";
            """);

            migrationBuilder.Sql("""
                ALTER TABLE "ClientMealLogs"
                DROP COLUMN IF EXISTS "AnalysisJson";
            """);

            migrationBuilder.Sql("""
                ALTER TABLE "ClientMealLogs"
                DROP COLUMN IF EXISTS "Source";
            """);
        }
    }
}