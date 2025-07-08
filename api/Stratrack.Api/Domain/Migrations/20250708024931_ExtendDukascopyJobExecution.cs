using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stratrack.Api.Domain.Migrations
{
    /// <inheritdoc />
    public partial class ExtendDukascopyJobExecution : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "Duration",
                table: "DukascopyJobExecutions",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<string>(
                name: "ErrorMessage",
                table: "DukascopyJobExecutions",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Symbol",
                table: "DukascopyJobExecutions",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "TargetTime",
                table: "DukascopyJobExecutions",
                type: "datetimeoffset",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Duration",
                table: "DukascopyJobExecutions");

            migrationBuilder.DropColumn(
                name: "ErrorMessage",
                table: "DukascopyJobExecutions");

            migrationBuilder.DropColumn(
                name: "Symbol",
                table: "DukascopyJobExecutions");

            migrationBuilder.DropColumn(
                name: "TargetTime",
                table: "DukascopyJobExecutions");
        }
    }
}
