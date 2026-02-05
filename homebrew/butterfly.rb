# Homebrew formula for Butterfly Security CLI
# To install: brew install butterfly-security/tap/butterfly

class Butterfly < Formula
  desc "Okta backup and recovery from your terminal"
  homepage "https://butterflysecurity.org"
  url "https://github.com/butterfly-security/cli/releases/download/v1.0.0/butterfly-v1.0.0.tar.gz"
  sha256 "PLACEHOLDER_SHA256"
  license "MIT"
  version "1.0.0"

  # For Node.js based distribution
  depends_on "node@20"

  def install
    # Install npm dependencies and build
    system "npm", "install", *Language::Node.std_npm_install_args(libexec)
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  # Alternative: For pre-built binary distribution
  # bottle do
  #   sha256 cellar: :any_skip_relocation, arm64_sonoma: "PLACEHOLDER"
  #   sha256 cellar: :any_skip_relocation, arm64_ventura: "PLACEHOLDER"
  #   sha256 cellar: :any_skip_relocation, sonoma: "PLACEHOLDER"
  #   sha256 cellar: :any_skip_relocation, ventura: "PLACEHOLDER"
  #   sha256 cellar: :any_skip_relocation, x86_64_linux: "PLACEHOLDER"
  # end

  test do
    assert_match "Butterfly Security CLI", shell_output("#{bin}/butterfly --help")
    assert_match version.to_s, shell_output("#{bin}/butterfly --version")
  end
end
