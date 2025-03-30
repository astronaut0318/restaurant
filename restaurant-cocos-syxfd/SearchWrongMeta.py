# -*- coding: utf-8 -*-

import os
import sys
import json

def main():

    for root,dirs,files in os.walk(sys.path[0]):
        for file in files:
            if not( ".meta" in file):
                continue;

            try:
                f = open(root + "\\" + file);
            except:
                print ("OpenFile ERROR!!!" + root + "\\" + file);

            try:
                dic = json.load(f);
            except:
                print ("JSON ERROR!!!!" + root + "\\" + file);

if __name__=="__main__":
    main();
