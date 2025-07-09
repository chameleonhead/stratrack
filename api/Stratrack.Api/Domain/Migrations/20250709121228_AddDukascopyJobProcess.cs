using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stratrack.Api.Domain.Migrations
{
    /// <inheritdoc />
    public partial class AddDukascopyJobProcess : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsProcessing",
                table: "DukascopyJobs",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "LastProcessError",
                table: "DukascopyJobs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "LastProcessFinishedAt",
                table: "DukascopyJobs",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "LastProcessStartedAt",
                table: "DukascopyJobs",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "LastProcessSucceeded",
                table: "DukascopyJobs",
                type: "bit",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsProcessing",
                table: "DukascopyJobs");

            migrationBuilder.DropColumn(
                name: "LastProcessError",
                table: "DukascopyJobs");

            migrationBuilder.DropColumn(
                name: "LastProcessFinishedAt",
                table: "DukascopyJobs");

            migrationBuilder.DropColumn(
                name: "LastProcessStartedAt",
                table: "DukascopyJobs");

            migrationBuilder.DropColumn(
                name: "LastProcessSucceeded",
                table: "DukascopyJobs");
        }
    }
}
