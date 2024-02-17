/**
  BSD License

  Copyright (c) 2015, Facebook, Inc. All rights reserved.

  Redistribution and use in source and binary forms, with or without modification,
  are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.

  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation
    and/or other materials provided with the distribution.

  * Neither the name Facebook nor the names of its contributors may be used to
    endorse or promote products derived from this software without specific
    prior written permission.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
  DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
  ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
  ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
declare var UserAgent_DEPRECATED: {
    /**
     *  Check if the UA is Internet Explorer.
     *
     *
     *  @return float|NaN Version number (if match) or NaN.
     */
    ie: () => any;
    /**
     * Check if we're in Internet Explorer compatibility mode.
     *
     * @return bool true if in compatibility mode, false if
     * not compatibility mode or not ie
     */
    ieCompatibilityMode: () => any;
    /**
     * Whether the browser is 64-bit IE.  Really, this is kind of weak sauce;  we
     * only need this because Skype can't handle 64-bit IE yet.  We need to remove
     * this when we don't need it -- tracked by #601957.
     */
    ie64: () => any;
    /**
     *  Check if the UA is Firefox.
     *
     *
     *  @return float|NaN Version number (if match) or NaN.
     */
    firefox: () => any;
    /**
     *  Check if the UA is Opera.
     *
     *
     *  @return float|NaN Version number (if match) or NaN.
     */
    opera: () => any;
    /**
     *  Check if the UA is WebKit.
     *
     *
     *  @return float|NaN Version number (if match) or NaN.
     */
    webkit: () => any;
    /**
     *  For Push
     *  WILL BE REMOVED VERY SOON. Use UserAgent_DEPRECATED.webkit
     */
    safari: () => any;
    /**
     *  Check if the UA is a Chrome browser.
     *
     *
     *  @return float|NaN Version number (if match) or NaN.
     */
    chrome: () => any;
    /**
     *  Check if the user is running Windows.
     *
     *  @return bool `true' if the user's OS is Windows.
     */
    windows: () => any;
    /**
     *  Check if the user is running Mac OS X.
     *
     *  @return float|bool   Returns a float if a version number is detected,
     *                       otherwise true/false.
     */
    osx: () => any;
    /**
     * Check if the user is running Linux.
     *
     * @return bool `true' if the user's OS is some flavor of Linux.
     */
    linux: () => any;
    /**
     * Check if the user is running on an iPhone or iPod platform.
     *
     * @return bool `true' if the user is running some flavor of the
     *    iPhone OS.
     */
    iphone: () => any;
    mobile: () => any;
    nativeApp: () => any;
    android: () => any;
    ipad: () => any;
};
export default UserAgent_DEPRECATED;
