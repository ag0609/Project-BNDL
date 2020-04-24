import sys
import base64
import os
import time
import random
import configparser

from wand.image import Image
from wand.color import Color
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# --------------Settings--------------
config = configparser.RawConfigParser()
config.read("./config.ini")

CHROMEDRIVER = config.get("require", "CHROMEDRIVE");
DTB = config.get("require", "DEATH_TO_BLANK");
IMGDIR = config.get("config", "IMGDIR")
SLEEP_TIME = int(config.get("config", "SLEEP_TIME"))
OVERWRITE = int(config.get("config", "OVERWRITE"))
MANUAL_LOGIN = int(config.get("config", "MANUAL_LOGIN"))
SNS = config.get("config", "SNS")
USEREMAIL = config.get("config", "USEREMAIL")
USERPASSWORD = config.get("config", "USERPASSWORD")
MANUAL_OPEN = int(config.get("config", "MANUAL_OPEN"))
LOADING_WAIT_TIME = int(config.get("config", "LOADING_WAIT_TIME"))
HIDE = int(config.get("config", "HIDE"))
DEBUG = int(config.get("config", "DEBUG"))
# --------------Settings--------------
debugstr = ''

if not os.path.isdir(IMGDIR):
    os.mkdir(IMGDIR)

def get_driver():
    option = webdriver.ChromeOptions()
    option.add_extension(DTB)
    option.add_argument('high-dpi-support=1')
    option.add_argument('device-scale-factor=1')
    option.add_argument('force-device-scale-factor=1')
    option.add_argument("--window-position=0,0");
    option.add_argument("disable-infobars");
#    if not DEBUG:
#        option.add_argument('headless')
    driver = webdriver.Chrome(chrome_options=option)
    return driver

def get_cookie_dict(cookies):
    cookies = cookies.split('; ')
    cookies_dict = {}
    for i in cookies:
        kv = i.split('=')
        cookies_dict[kv[0]] = kv[1]
    return cookies_dict

def add_cookies(driver, cookies):
    for i in cookies:
        driver.add_cookie({'name': i, 'value': cookies[i]})

def star_str(txt, times, star='*'):
    if not len(txt) or not times > 0:
        return ''
    if not len(star):
        star = '*'
    if times > len(txt):
        times = len(txt)
    txt_arr = list(txt)
    for i in range(0,times):
        tar = random.randint(0,len(txt) -1)
        if txt_arr[tar] == '*':
            i -= 1
        else:
            txt_arr[tar] = '*'
    return ''.join(txt_arr)

def login(driver, email, password):
    print('Start auto login...')
    uri = 'https://member.bookwalker.jp/app/03/login'
    usrf = '#mailAddress'
    pwf = '#password'
    sbmbtn = 'button[name=loginBtn]'
    if SNS == 'nico':
        uri = 'https://member.bookwalker.jp/app/snslogin/auth?initAuthReq=on&plt=03&rememberme=off&to=NN'
        usrf = '#input__mailtel'
        pwf = '#input__password'
        sbmbtn = '#login__submit'
    debugmsg("[%s] (%s@%s) %s %s %s %s" % (SNS, email, star_str(password, len(password)), uri, usrf, pwf, sbmbtn))
    driver.get(uri)
    driver.find_elements_by_css_selector(usrf)[0].send_keys(email)
    driver.find_elements_by_css_selector(pwf)[0].send_keys(password)
    driver.find_elements_by_css_selector(sbmbtn)[0].click()

def check_is_loading(list_ele):
    is_loading = False
    for i in list_ele:
        if i.is_displayed() is True:
            is_loading = True
            break
    return is_loading

def resize_window(w, h):
    driver.maximize_window()
    ww = driver.manage().window.width;

def chk_tabs_url(driver, s):
    return s in driver.current_url

def savewh(w,h):
    global imgw
    global imgh
    (imgw, imgh) = (w,h)

def debugmsg(msg):
    global debugstr
    if DEBUG:
        print("[debug]: %s" % msg)
    debugstr = msg

def esp_path(p):
    res = p.replace(':', '-')
    return res

def zoom_in(driver):
    
    return str(driver.find_element_by_id('zoomRatio').text)

def main():
    debugmsg('Start Define Driver...')
    driver = get_driver()
    driver.get('https://member.bookwalker.jp/app/03/login')
    if not MANUAL_OPEN:
        print('Automated Login...')
        if USEREMAIL and USERPASSWORD:
            print('Using password login...')
            login(driver, USEREMAIL, USERPASSWORD)
        else:
            print('Using Cookies for login...')
            driver.delete_all_cookies()
            add_cookies(driver, get_cookie_dict(COOKIES))
        driver.get(MANGA_URL)
    else:
        if not MANUAL_LOGIN:
            login(driver, USEREMAIL, USERPASSWORD)
        print('Please login...')
        WebDriverWait(driver, 300).until(lambda x: chk_tabs_url(driver, 'profile'))
        print('Member page redirected, login succuss!')
        driver.get('https://bookwalker.jp/holdBooks')
        print('Please open a book...')
        WebDriverWait(driver, 86400).until(lambda x: chk_tabs_url(driver, 'viewer'))
        print('Book Viewer tab detected, please wait...')
        print('Resize window and Set Single page in config')
#    driver.maximize_window()
#    time.sleep(0.5)
    if HIDE:
        print('Moving Browser Window out of monitor range..')
        driver.set_window_position(0,3000)
    WebDriverWait(driver, 120).until(
            lambda x: x.find_elements_by_css_selector("#showSettingPanel"))
    WebDriverWait(driver, 30).until(
            lambda x: x.find_elements_by_css_selector("#renderer"))
    renderer = driver.find_element_by_css_selector("#renderer")
    time.sleep(0.5)
    WebDriverWait(driver, 30).until(
            lambda x: x.find_elements_by_css_selector("#menu"))
    webdriver.ActionChains(driver).move_to_element(driver.find_element_by_css_selector("#menu")).click().perform()
    WebDriverWait(driver, 30).until(
            lambda x: x.find_elements_by_css_selector("#showSettingPanel"))
    driver.find_element_by_css_selector("#showSettingPanel").click()
    WebDriverWait(driver, 30).until(
            lambda x: x.find_element_by_xpath("//label[@for='spread_false']"))
    driver.find_element_by_xpath("//label[@for='spread_false']").click()
    webdriver.ActionChains(driver).move_by_offset(0,200).click().perform()
    webdriver.ActionChains(driver).send_keys_to_element(renderer, Keys.HOME).perform()
    print('Preparing for downloading...')
    try:    
        booktitle = driver.title;
        print("Book Title: %s" % booktitle)
        page_count = int(str(driver.find_element_by_id(
            'pageSliderCounter').text).split('/')[1])
        print("Pages: %s" % page_count)
        IMGDIRT = str("%s/%s" % (IMGDIR, esp_path(booktitle)))
        debugmsg(IMGDIRT)
        if not os.path.isdir(IMGDIRT):
            os.mkdir(IMGDIRT)
        global imgw
        global imgh
        (imgw, imgh) = (0,0)
        (xoff, yoff) = (0,0)
        for i in range(page_count):
            imgfullpath = IMGDIRT + '/%.3d.jpg' % i
            if os.path.exists(imgfullpath):
                if not OVERWRITE:
                    debugmsg("%.3d.jpg exists! Skipped due to non-OVERWRITE mode..." % i)
                    continue
            cur_page = int(str(driver.find_element_by_id('pageSliderCounter').text).split('/')[0]) -1
            while i != cur_page:
                cur_page = int(str(driver.find_element_by_id('pageSliderCounter').text).split('/')[0]) -1
                debugmsg("Current Page: %s, Target Page: %s" % (cur_page, i+1))
                if(abs(cur_page - i) > abs(page_count - i)):
                    debugmsg("Jumo to End...")
                    webdriver.ActionChains(driver).send_keys_to_element(
                        driver.find_element_by_css_selector("#renderer"), Keys.END).perform()
                    continue
                if i < cur_page:
                    debugmsg("Going Back...")
                    webdriver.ActionChains(driver).send_keys_to_element(
                        driver.find_element_by_css_selector("#renderer"), Keys.PAGE_UP).perform()
                    continue
                if i > cur_page:
                    debugmsg("Going Forward...")
                    webdriver.ActionChains(driver).send_keys_to_element(
                        driver.find_element_by_css_selector("#renderer"), Keys.PAGE_DOWN).perform()
            WebDriverWait(driver, 30).until_not(lambda x: check_is_loading(
                x.find_elements_by_css_selector(".loading")))
            canvas = driver.find_element_by_css_selector(
                ".currentScreen canvas")
            zoomRatio = str(driver.find_element_by_id('zoomRatio').text)
            # Loop and double click random place on canvas until zoom-in success
            while zoomRatio != '200%':
                xoff = int(random.choice([0, 125, -125, 250, -250]) + random.randrange(-50,50))
                yoff = int(random.choice([0, 150, -150, 300, -300]) + random.randrange(-100,100))
                debugmsg("offset: (%s, %s)" % (xoff,yoff))
                webdriver.ActionChains(driver).move_to_element(
                    canvas).move_by_offset(xoff,yoff).double_click().perform()
                time.sleep(0.5)
                zoomRatio = str(driver.find_element_by_id('zoomRatio').text)
#            WebDriverWait(driver,10).until( str(x.find_element_by_id('zoomRatio').text) == '200%')
            img_base64 = driver.execute_script(
                "return arguments[0].toDataURL('image/jpeg').substring(22);", canvas)
            debugmsg("Zoom: %s" % zoomRatio)
            with open(".tmp.jpg", 'wb') as f:
                f.write(base64.b64decode(img_base64))
                with Image(filename=".tmp.jpg") as img:
                    if imgw > 0: debugmsg("saved wh: %s, %s" % (imgw, imgh))
                    debugmsg("before trim: %s, %s" % (img.width, img.height))
                    if imgw==0:
                        fuzzRatio = 13.3
                        img.trim(Color("WHITE"), fuzz=fuzzRatio)
                        savewh(img.width, img.height)
                        debugmsg("Trim size saved: %s, %s(Fuzz=%s)" % (img.width, img.height, fuzzRatio))
                    else:
                        img.crop(width=imgw, height=imgh, gravity='center')
                    debugmsg("After trim: %s, %s" % (img.width, img.height))
                    img.save(filename=imgfullpath)
                print('Page %s/%s Downloaded' % (str(i + 1), str(page_count)))
                if i + 1 >= page_count:
                    print('Finished.')
                    break
#            Turn to next page
#           ARROW_LEFT, A, J not work when zooming in(will paning left) and when menu ui appear(no respone)
#           PAGE_DOWN can turn to next page when zooming in and menu bar appear
            webdriver.ActionChains(driver).send_keys_to_element(
                driver.find_element_by_css_selector("#renderer"), Keys.PAGE_DOWN).perform()
            time.sleep(SLEEP_TIME)
    except:
        driver.save_screenshot('./error.png')
        debugmsg(sys.exc_info()[0])
        print('Something wrong or download finished, Please check the error.png to see the web page.')
        print('Normally, you should logout and login, then renew the cookies to solve this problem.')
        print('Otherwise, multiple visit on same book detected, please wait one hour for penaty time')
    driver.get('https://member.bookwalker.jp/app/03/logout')
    time.sleep(SLEEP_TIME)
    driver.close()

if __name__ == '__main__':
    main()
