using Microsoft.EntityFrameworkCore.Migrations;
using MyDietitianMobileApp.Infrastructure.Persistence;

#nullable disable

namespace MyDietitianMobileApp.Infrastructure.Migrations
{
    [Microsoft.EntityFrameworkCore.Infrastructure.DbContext(typeof(AppDbContext))]
    [Migration("20260617140000_AddPantryReceiptHistory")]
    public partial class AddPantryReceiptHistory : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ClientPantryReceipts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ClientId = table.Column<Guid>(type: "uuid", nullable: false),
                    SessionId = table.Column<Guid>(type: "uuid", nullable: true),
                    SavedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ReceiptDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    StoreName = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: true),
                    Currency = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: false, defaultValue: "TRY"),
                    TotalAmount = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClientPantryReceipts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClientPantryReceipts_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ClientPantryReceiptLines",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ReceiptId = table.Column<Guid>(type: "uuid", nullable: false),
                    IngredientId = table.Column<Guid>(type: "uuid", nullable: false),
                    RawLine = table.Column<string>(type: "character varying(600)", maxLength: 600, nullable: false),
                    ProductName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Quantity = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: true),
                    Unit = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    UnitPrice = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: true),
                    LineTotal = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: true),
                    Currency = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: false, defaultValue: "TRY"),
                    SortOrder = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClientPantryReceiptLines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClientPantryReceiptLines_ClientPantryReceipts_ReceiptId",
                        column: x => x.ReceiptId,
                        principalTable: "ClientPantryReceipts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ClientPantryReceiptLines_Ingredients_IngredientId",
                        column: x => x.IngredientId,
                        principalTable: "Ingredients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ClientPantryReceiptLines_IngredientId",
                table: "ClientPantryReceiptLines",
                column: "IngredientId");

            migrationBuilder.CreateIndex(
                name: "IX_ClientPantryReceiptLines_ReceiptId",
                table: "ClientPantryReceiptLines",
                column: "ReceiptId");

            migrationBuilder.CreateIndex(
                name: "IX_ClientPantryReceipts_ClientId_SavedAtUtc",
                table: "ClientPantryReceipts",
                columns: new[] { "ClientId", "SavedAtUtc" },
                descending: new[] { false, true });

            migrationBuilder.CreateIndex(
                name: "IX_ClientPantryReceipts_SessionId",
                table: "ClientPantryReceipts",
                column: "SessionId");

            migrationBuilder.Sql("""
                DO $$
                DECLARE
                    target_id uuid;
                    seeded_id uuid := '5a95bf70-7285-4b57-9d31-6f578831b3c4';
                    merged_aliases jsonb;
                BEGIN
                    SELECT "Id"
                    INTO target_id
                    FROM "Ingredients"
                    WHERE lower("CanonicalName") = lower('Kırmızı Biber')
                    ORDER BY "Id"
                    LIMIT 1;

                    IF target_id IS NULL THEN
                        INSERT INTO "Ingredients" (
                            "Id",
                            "CanonicalName",
                            "Name",
                            "IsActive",
                            "IsCondiment",
                            "IsMandatory",
                            "IsProhibited",
                            "Aliases")
                        VALUES (
                            seeded_id,
                            'Kırmızı Biber',
                            'Kırmızı Biber',
                            TRUE,
                            FALSE,
                            FALSE,
                            FALSE,
                            '["kirmizi biber","kırmızı biber","kirmızı biber"]'::jsonb);
                    ELSE
                        SELECT jsonb_agg(DISTINCT alias_value)
                        INTO merged_aliases
                        FROM (
                            SELECT jsonb_array_elements_text(COALESCE("Aliases", '[]'::jsonb)) AS alias_value
                            FROM "Ingredients"
                            WHERE "Id" = target_id
                            UNION ALL
                            SELECT unnest(ARRAY['kirmizi biber','kırmızı biber','kirmızı biber'])
                        ) aliases;

                        UPDATE "Ingredients"
                        SET "Aliases" = COALESCE(merged_aliases, '[]'::jsonb)
                        WHERE "Id" = target_id;
                    END IF;
                END $$;
                """);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "ClientPantryReceiptLines");
            migrationBuilder.DropTable(name: "ClientPantryReceipts");

            migrationBuilder.Sql("""
                DELETE FROM "Ingredients"
                WHERE "Id" = '5a95bf70-7285-4b57-9d31-6f578831b3c4'
                  AND "CanonicalName" = 'Kırmızı Biber';
                """);
        }
    }
}
