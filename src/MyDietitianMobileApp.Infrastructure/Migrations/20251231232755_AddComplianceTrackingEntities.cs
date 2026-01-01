using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyDietitianMobileApp.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddComplianceTrackingEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ComplianceScoreConfigs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DietitianId = table.Column<Guid>(type: "uuid", nullable: true),
                    DietPlanId = table.Column<Guid>(type: "uuid", nullable: true),
                    MandatoryDone = table.Column<int>(type: "integer", nullable: false, defaultValue: 10),
                    MandatoryAlternative = table.Column<int>(type: "integer", nullable: false, defaultValue: 7),
                    MandatorySkipped = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    OptionalDone = table.Column<int>(type: "integer", nullable: false, defaultValue: 3),
                    OptionalSkipped = table.Column<int>(type: "integer", nullable: false, defaultValue: 0)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ComplianceScoreConfigs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DietPlans",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DietitianId = table.Column<Guid>(type: "uuid", nullable: false),
                    ClientId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DietPlans", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DietDays",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DietPlanId = table.Column<Guid>(type: "uuid", nullable: false),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DietPlanId1 = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DietDays", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DietDays_DietPlans_DietPlanId",
                        column: x => x.DietPlanId,
                        principalTable: "DietPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DietDays_DietPlans_DietPlanId1",
                        column: x => x.DietPlanId1,
                        principalTable: "DietPlans",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Meals",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DietDayId = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    RecipeId = table.Column<Guid>(type: "uuid", nullable: true),
                    CustomName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    DietDayId1 = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Meals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Meals_DietDays_DietDayId",
                        column: x => x.DietDayId,
                        principalTable: "DietDays",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Meals_DietDays_DietDayId1",
                        column: x => x.DietDayId1,
                        principalTable: "DietDays",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "MealItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MealId = table.Column<Guid>(type: "uuid", nullable: false),
                    IngredientId = table.Column<Guid>(type: "uuid", nullable: false),
                    IsMandatory = table.Column<bool>(type: "boolean", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: true),
                    Unit = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    MealId1 = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MealItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MealItems_Meals_MealId",
                        column: x => x.MealId,
                        principalTable: "Meals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MealItems_Meals_MealId1",
                        column: x => x.MealId1,
                        principalTable: "Meals",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "MealItemCompliance",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ClientId = table.Column<Guid>(type: "uuid", nullable: false),
                    DietPlanId = table.Column<Guid>(type: "uuid", nullable: false),
                    DietDayId = table.Column<Guid>(type: "uuid", nullable: false),
                    MealId = table.Column<Guid>(type: "uuid", nullable: false),
                    MealItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    IngredientId = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    AlternativeIngredientId = table.Column<Guid>(type: "uuid", nullable: true),
                    MarkedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ClientTimezoneOffsetMinutes = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MealItemCompliance", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MealItemCompliance_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MealItemCompliance_DietDays_DietDayId",
                        column: x => x.DietDayId,
                        principalTable: "DietDays",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MealItemCompliance_DietPlans_DietPlanId",
                        column: x => x.DietPlanId,
                        principalTable: "DietPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MealItemCompliance_Ingredients_IngredientId",
                        column: x => x.IngredientId,
                        principalTable: "Ingredients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MealItemCompliance_MealItems_MealItemId",
                        column: x => x.MealItemId,
                        principalTable: "MealItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MealItemCompliance_Meals_MealId",
                        column: x => x.MealId,
                        principalTable: "Meals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ComplianceScoreConfigs_DietitianId",
                table: "ComplianceScoreConfigs",
                column: "DietitianId");

            migrationBuilder.CreateIndex(
                name: "IX_ComplianceScoreConfigs_DietitianId_DietPlanId",
                table: "ComplianceScoreConfigs",
                columns: new[] { "DietitianId", "DietPlanId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ComplianceScoreConfigs_DietPlanId",
                table: "ComplianceScoreConfigs",
                column: "DietPlanId");

            migrationBuilder.CreateIndex(
                name: "IX_DietDays_DietPlanId",
                table: "DietDays",
                column: "DietPlanId");

            migrationBuilder.CreateIndex(
                name: "IX_DietDays_DietPlanId_Date",
                table: "DietDays",
                columns: new[] { "DietPlanId", "Date" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DietDays_DietPlanId1",
                table: "DietDays",
                column: "DietPlanId1");

            migrationBuilder.CreateIndex(
                name: "IX_DietPlans_ClientId",
                table: "DietPlans",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_DietPlans_ClientId_IsActive",
                table: "DietPlans",
                columns: new[] { "ClientId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_DietPlans_DietitianId",
                table: "DietPlans",
                column: "DietitianId");

            migrationBuilder.CreateIndex(
                name: "IX_MealItemCompliance_ClientId_DietPlanId",
                table: "MealItemCompliance",
                columns: new[] { "ClientId", "DietPlanId" });

            migrationBuilder.CreateIndex(
                name: "IX_MealItemCompliance_ClientId_MarkedAt",
                table: "MealItemCompliance",
                columns: new[] { "ClientId", "MarkedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_MealItemCompliance_ClientId_MealItemId_DietDayId",
                table: "MealItemCompliance",
                columns: new[] { "ClientId", "MealItemId", "DietDayId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MealItemCompliance_DietDayId",
                table: "MealItemCompliance",
                column: "DietDayId");

            migrationBuilder.CreateIndex(
                name: "IX_MealItemCompliance_DietPlanId",
                table: "MealItemCompliance",
                column: "DietPlanId");

            migrationBuilder.CreateIndex(
                name: "IX_MealItemCompliance_IngredientId",
                table: "MealItemCompliance",
                column: "IngredientId");

            migrationBuilder.CreateIndex(
                name: "IX_MealItemCompliance_MarkedAt",
                table: "MealItemCompliance",
                column: "MarkedAt");

            migrationBuilder.CreateIndex(
                name: "IX_MealItemCompliance_MealId",
                table: "MealItemCompliance",
                column: "MealId");

            migrationBuilder.CreateIndex(
                name: "IX_MealItemCompliance_MealItemId",
                table: "MealItemCompliance",
                column: "MealItemId");

            migrationBuilder.CreateIndex(
                name: "IX_MealItems_IngredientId",
                table: "MealItems",
                column: "IngredientId");

            migrationBuilder.CreateIndex(
                name: "IX_MealItems_MealId",
                table: "MealItems",
                column: "MealId");

            migrationBuilder.CreateIndex(
                name: "IX_MealItems_MealId1",
                table: "MealItems",
                column: "MealId1");

            migrationBuilder.CreateIndex(
                name: "IX_Meals_DietDayId",
                table: "Meals",
                column: "DietDayId");

            migrationBuilder.CreateIndex(
                name: "IX_Meals_DietDayId_Type",
                table: "Meals",
                columns: new[] { "DietDayId", "Type" });

            migrationBuilder.CreateIndex(
                name: "IX_Meals_DietDayId1",
                table: "Meals",
                column: "DietDayId1");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ComplianceScoreConfigs");

            migrationBuilder.DropTable(
                name: "MealItemCompliance");

            migrationBuilder.DropTable(
                name: "MealItems");

            migrationBuilder.DropTable(
                name: "Meals");

            migrationBuilder.DropTable(
                name: "DietDays");

            migrationBuilder.DropTable(
                name: "DietPlans");
        }
    }
}
