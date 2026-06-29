from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_required_documentation_files_exist() -> None:
    required_files = [
        "README.md",
        "CONTRIBUTING.md",
        "USER_MANUAL.md",
        "AGENTS.md",
        "LICENSE",
    ]

    for filename in required_files:
        assert (ROOT / filename).is_file()


def test_environment_example_does_not_contain_real_secret_names() -> None:
    env_example = (ROOT / ".env.example").read_text(encoding="utf-8")

    assert "your_gitlab_token_here" not in env_example
    assert "PASSWORD=" not in env_example
